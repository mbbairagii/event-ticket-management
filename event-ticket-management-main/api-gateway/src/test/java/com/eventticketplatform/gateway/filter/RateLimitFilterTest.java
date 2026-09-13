package com.eventticketplatform.gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

import java.lang.reflect.Field;
import java.util.concurrent.ConcurrentHashMap;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    // Functional interface — no Mockito needed
    private final GatewayFilterChain chain = exchange -> Mono.empty();

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
    }

    // ── General path: burst of 60 should all pass ─────────────────────────────

    @Test
    @DisplayName("General path: first 60 requests (burst) from same IP are allowed")
    void generalPath_burstAllowed() {
        for (int i = 0; i < 60; i++) {
            var exchange = mockExchange("/api/events", "10.0.0.1");
            filter.filter(exchange, chain).block();
            assertThat(exchange.getResponse().getStatusCode())
                    .as("Request %d should pass", i + 1)
                    .isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    @Test
    @DisplayName("General path: next request after bucket drained is rate-limited (429)")
    void generalPath_afterExhaust_rateLimited() throws Exception {
        drainBucket("10.0.0.2", false);
        var exchange = mockExchange("/api/events", "10.0.0.2");
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode())
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── Auth path ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Auth path (/api/users/login): first 10 requests are allowed")
    void authPath_burstAllowed() {
        for (int i = 0; i < 10; i++) {
            var exchange = mockExchange("/api/users/login", "10.0.0.3");
            filter.filter(exchange, chain).block();
            assertThat(exchange.getResponse().getStatusCode())
                    .as("Auth request %d should pass", i + 1)
                    .isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    @Test
    @DisplayName("Auth path (/api/users/login): next request after bucket drained is 429")
    void authPath_afterExhaust_rateLimited() throws Exception {
        drainBucket("10.0.0.4", true);
        var exchange = mockExchange("/api/users/login", "10.0.0.4");
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode())
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    @Test
    @DisplayName("Auth path (/api/users/register): also gets stricter limit")
    void registerPath_afterExhaust_rateLimited() throws Exception {
        drainBucket("10.0.0.5", true);
        var exchange = mockExchange("/api/users/register", "10.0.0.5");
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode())
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── Different IPs have independent buckets ────────────────────────────────

    @Test
    @DisplayName("Different IPs have independent rate-limit buckets")
    void differentIps_independentBuckets() throws Exception {
        // Exhaust IP A
        drainBucket("192.168.1.1", false);
        // IP B should still be allowed (fresh bucket)
        var exchangeB = mockExchange("/api/events", "192.168.1.2");
        filter.filter(exchangeB, chain).block();
        assertThat(exchangeB.getResponse().getStatusCode())
                .isNotEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── 429 response shape ────────────────────────────────────────────────────

    @Test
    @DisplayName("429 response includes Retry-After: 1 header")
    void rateLimited_response_hasRetryAfterHeader() throws Exception {
        drainBucket("10.0.0.9", false);
        var exchange = mockExchange("/api/events", "10.0.0.9");
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getHeaders().getFirst("Retry-After")).isEqualTo("1");
    }

    // ── IP resolution: X-Forwarded-For takes precedence ──────────────────────

    @Test
    @DisplayName("X-Forwarded-For header is used for IP bucketing")
    void ipResolution_xForwardedFor_usedFirst() throws Exception {
        drainBucketXff("1.2.3.4");
        var exchange = mockExchangeWithXff("/api/events", "1.2.3.4");
        filter.filter(exchange, chain).block();
        assertThat(exchange.getResponse().getStatusCode())
                .isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── Filter order ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getOrder() returns -2 (runs before JWT filter at -1)")
    void filterOrder_isMinusTwo() {
        assertThat(filter.getOrder()).isEqualTo(-2);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private MockServerWebExchange mockExchange(String path, String remoteIp) {
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://" + remoteIp + path)
                .remoteAddress(new java.net.InetSocketAddress(remoteIp, 12345))
                .build();
        return MockServerWebExchange.from(request);
    }

    private MockServerWebExchange mockExchangeWithXff(String path, String xff) {
        MockServerHttpRequest request = MockServerHttpRequest
                .get("http://10.0.0.0" + path)
                .header("X-Forwarded-For", xff)
                .build();
        return MockServerWebExchange.from(request);
    }

    /**
     * Uses reflection to instantly drain the token bucket for the given IP,
     * avoiding the timing-dependent refill race that makes loop-based exhaustion flaky.
     */
    private void drainBucket(String ip, boolean isAuth) throws Exception {
        // First request to ensure the bucket is created
        String path = isAuth ? "/api/users/login" : "/api/events";
        filter.filter(mockExchange(path, ip), chain).block();

        Field bucketsField = RateLimitFilter.class.getDeclaredField("buckets");
        bucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> buckets =
                (ConcurrentHashMap<String, Object>) bucketsField.get(filter);

        String key = ip + (isAuth ? ":auth" : ":api");
        Object bucket = buckets.get(key);

        // Set tokens to 0 and reset lastRefillMs to now so no immediate refill
        Field tokensField = bucket.getClass().getDeclaredField("tokens");
        tokensField.setAccessible(true);
        tokensField.setDouble(bucket, 0.0);

        Field lastRefillField = bucket.getClass().getDeclaredField("lastRefillMs");
        lastRefillField.setAccessible(true);
        lastRefillField.setLong(bucket, System.currentTimeMillis());
    }

    /**
     * Drain variant for XFF-keyed buckets (no remote address, uses XFF header for IP).
     */
    private void drainBucketXff(String xff) throws Exception {
        // Send one request to create the bucket under the XFF-derived key
        filter.filter(mockExchangeWithXff("/api/events", xff), chain).block();

        Field bucketsField = RateLimitFilter.class.getDeclaredField("buckets");
        bucketsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Object> buckets =
                (ConcurrentHashMap<String, Object>) bucketsField.get(filter);

        String key = xff + ":api";
        Object bucket = buckets.get(key);

        Field tokensField = bucket.getClass().getDeclaredField("tokens");
        tokensField.setAccessible(true);
        tokensField.setDouble(bucket, 0.0);

        Field lastRefillField = bucket.getClass().getDeclaredField("lastRefillMs");
        lastRefillField.setAccessible(true);
        lastRefillField.setLong(bucket, System.currentTimeMillis());
    }
}
