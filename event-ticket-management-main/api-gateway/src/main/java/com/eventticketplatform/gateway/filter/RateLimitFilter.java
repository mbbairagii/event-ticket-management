package com.eventticketplatform.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token-bucket DDoS / rate-limit GlobalFilter for the API Gateway.
 *
 * Limits:
 *   - 30 req/sec per IP (burst up to 60)
 *   - 5  req/sec per IP on auth/register paths (burst up to 10) — anti brute-force
 *
 * Returns HTTP 429 with Retry-After:1 and a JSON error body when exceeded.
 * Zero external dependencies — no Redis required.
 */
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final int MAX_TOKENS      = 60;
    private static final int REFILL_RATE     = 30; // tokens/second for general paths
    private static final int AUTH_MAX_TOKENS = 10;
    private static final int AUTH_REFILL     = 5;  // tokens/second for auth paths
    private static final long EVICT_AFTER_MS = 120_000L;

    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path     = exchange.getRequest().getURI().getPath();
        String ip       = resolveClientIp(exchange);
        boolean isAuth  = path.startsWith("/api/users/login")
                       || path.startsWith("/api/users/register");

        String key   = ip + (isAuth ? ":auth" : ":api");
        int maxTok   = isAuth ? AUTH_MAX_TOKENS : MAX_TOKENS;
        int refill   = isAuth ? AUTH_REFILL     : REFILL_RATE;

        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(maxTok, refill));

        if (Math.random() < 0.005) evictStaleBuckets();

        if (!bucket.tryConsume()) {
            return tooManyRequests(exchange);
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() { return -2; } // Run before JWT filter (order -1)

    // ── helpers ──────────────────────────────────────────────────────────────

    private String resolveClientIp(ServerWebExchange exchange) {
        String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String xri = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        InetSocketAddress addr = exchange.getRequest().getRemoteAddress();
        return addr != null ? addr.getAddress().getHostAddress() : "unknown";
    }

    private Mono<Void> tooManyRequests(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set("Retry-After", "1");
        String body = "{\"status\":429,\"error\":\"Too Many Requests\"," +
                      "\"message\":\"Rate limit exceeded. Please retry after 1 second.\"}";
        DataBuffer buf = exchange.getResponse().bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(buf));
    }

    private void evictStaleBuckets() {
        long cutoff = System.currentTimeMillis() - EVICT_AFTER_MS;
        buckets.entrySet().removeIf(e -> e.getValue().lastAccessMs < cutoff);
    }

    // ── Token Bucket (thread-safe) ───────────────────────────────────────────

    private static final class TokenBucket {
        private final int maxTokens;
        private final int refillRate;
        private double tokens;
        volatile long lastAccessMs;
        private long lastRefillMs;

        TokenBucket(int maxTokens, int refillRate) {
            this.maxTokens   = maxTokens;
            this.refillRate  = refillRate;
            this.tokens      = maxTokens;
            this.lastRefillMs = System.currentTimeMillis();
            this.lastAccessMs = this.lastRefillMs;
        }

        synchronized boolean tryConsume() {
            long now   = System.currentTimeMillis();
            lastAccessMs = now;
            long elapsed = now - lastRefillMs;
            if (elapsed > 0) {
                tokens = Math.min(maxTokens, tokens + (elapsed / 1000.0) * refillRate);
                lastRefillMs = now;
            }
            if (tokens >= 1.0) { tokens -= 1.0; return true; }
            return false;
        }
    }
}
