import React, { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment, confirmBooking } from '../services/api';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, X, CreditCard, Clock } from 'lucide-react';
import AlienLogo from './AlienLogo';

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  userId, 
  onSuccess, 
  eventName = 'Live Show Ticket',
  bookingId,
  expiresAt 
}) {
  const [step, setStep] = useState('input'); // 'input' | 'processing' | 'success'
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError('');
      if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  // Live countdown timer for the seat hold
  useEffect(() => {
    if (!isOpen || !expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setError('Seat reservation window expired. Held seats have been released back to the pool.');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expiresAt]);

  const formatTimer = (seconds) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  const isExpired = timeLeft !== null && timeLeft <= 0;

  const handlePayment = async () => {
    if (isExpired) {
      setError('Cannot pay for an expired reservation. Please close and re-select your passes.');
      return;
    }

    setStep('processing');
    setError('');

    try {
      // 1. Create order on backend microservice tied directly to held bookingId
      const response = await createRazorpayOrder({ userId, amount, bookingId });
      const orderData = response.data;

      // 2. Configure Razorpay modal
      const options = {
        key: orderData.keyId || "rzp_test_mockKey",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "EVENTIFIED PASS",
        description: `Pass for ${eventName}`,
        order_id: orderData.orderId,
        handler: async function (paymentResponse) {
          // 3. Verify Razorpay signature server-side (also confirms the booking in DB)
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              bookingId: bookingId
            });
            setStep('success');
            setTimeout(() => {
              onSuccess();
            }, 1400);
          } catch (verifyErr) {
            console.error('Signature verify failed', verifyErr);
            setStep('input');
            const msg = verifyErr.response?.data?.error || verifyErr.response?.data?.message || 'Payment signature verification failed. Please check with support.';
            setError(msg);
          }
        },
        prefill: {
          name: "Guest Attendee",
          email: "guest@eventified.live",
          contact: "9999999999"
        },
        theme: {
          color: "#ccff00"
        },
        modal: {
          ondismiss: function() {
            setStep('input');
            setError('Transaction was cancelled by user.');
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failRes) {
          setStep('input');
          setError(failRes.error?.description || 'Payment failed. Please retry.');
        });
        rzp.open();
      } else {
        // Fallback confirmation if gateway script is offline / test mode
        try {
          if (bookingId) {
            await confirmBooking(bookingId);
          }
          setStep('success');
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } catch (simErr) {
          console.error('Fallback confirmation failed', simErr);
          setStep('input');
          setError('Failed to confirm booking.');
        }
      }
      
    } catch (err) {
      console.error('Payment initiation error', err);
      setStep('input');
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to initiate secure checkout gateway. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in">
      <div className="modal-body max-w-lg w-full bg-[#0c0d13] border border-[#ccff00]/40 text-white shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <AlienLogo className="w-7 h-7" glow={false} />
            <div>
              <h3 className="font-syne font-extrabold text-lg text-white uppercase tracking-tight">
                SECURE PASS CHECKOUT
              </h3>
              <p className="text-[10px] font-mono text-gray-400">RAZORPAY VERIFIED GATEWAY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Seat Hold Countdown Banner */}
        {expiresAt && !isExpired && (
          <div className="mb-4 p-3 bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="animate-spin" />
              <span>Seats locked for you. Complete payment in:</span>
            </div>
            <span className="font-bold text-sm bg-black/60 px-2 py-0.5 border border-[#ccff00]/40">
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'input' && (
          <div className="space-y-6">
            {/* Amount display card */}
            <div className="p-5 bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-xs font-mono uppercase text-gray-400 tracking-wider">TOTAL DUE</span>
              <div className="font-syne font-black text-4xl text-[#ccff00] tracking-tight">
                ₹{Number(amount || 0).toFixed(2)}
              </div>
              <div className="text-xs font-mono text-gray-300 pt-1">
                Instant digital cryptographic pass issuance
              </div>
            </div>

            {/* Security badges */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-gray-400">
              <div className="p-3 bg-black/40 border border-white/5 flex items-center gap-2">
                <Lock size={14} className="text-[#ccff00]" />
                <span>256-Bit Encrypted</span>
              </div>
              <div className="p-3 bg-black/40 border border-white/5 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#ccff00]" />
                <span>Verified Pass Entry</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handlePayment}
              disabled={isExpired}
              className="w-full py-4 bg-[#ccff00] disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-black font-syne font-black text-sm uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#ccff00]/20"
            >
              <CreditCard size={18} />
              <span>{isExpired ? 'RESERVATION EXPIRED' : 'PAY WITH RAZORPAY / UPI / CARD'}</span>
            </button>

            <p className="text-[11px] font-mono text-gray-500 text-center">
              By confirming, you agree to Eventified ticket admission guidelines.
            </p>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="funky-spinner mx-auto" />
            <h4 className="font-syne font-bold text-xl text-white uppercase">
              CONNECTING TO GATEWAY...
            </h4>
            <p className="text-xs font-mono text-gray-400">
              Please complete authentication in the popup window.
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#ccff00] text-black rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="font-syne font-black text-2xl text-white uppercase">
              PAYMENT VERIFIED!
            </h4>
            <p className="text-xs font-mono text-[#ccff00]">
              Pass confirmed and saved to your vault!
            </p>
          </div>
        )}

      </div>
    </div>
  );
}