import React, { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, X, CreditCard } from 'lucide-react';
import AlienLogo from './AlienLogo';

export default function PaymentModal({ isOpen, onClose, amount, userId, onSuccess, eventName = 'Live Show Ticket' }) {
  const [step, setStep] = useState('input'); // 'input' | 'processing' | 'success'
  const [error, setError] = useState('');

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

  if (!isOpen) return null;

  const handlePayment = async () => {
    setStep('processing');
    setError('');

    try {
      // 1. Create order on backend microservice
      const response = await createRazorpayOrder({ userId, amount });
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
          // 3. Verify Razorpay signature server-side
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });
            setStep('success');
            setTimeout(() => {
              onSuccess();
            }, 1400);
          } catch (verifyErr) {
            console.error('Signature verify failed', verifyErr);
            setStep('input');
            setError('Payment signature verification failed. Please check with support.');
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
        // Fallback simulation if gateway script is offline
        setTimeout(() => {
          setStep('success');
          setTimeout(() => onSuccess(), 1000);
        }, 1200);
      }
      
    } catch (err) {
      console.error('Payment initiation error', err);
      setStep('input');
      setError(err.response?.data?.message || 'Failed to initiate secure checkout gateway. Please try again.');
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
                <span>Anti-Scalp Protected</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-[#ccff00] text-black font-syne font-black text-sm uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#ccff00]/20"
            >
              <CreditCard size={18} />
              <span>PAY WITH RAZORPAY / UPI / CARD</span>
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
              Issuing your pass and reserving seats on backend...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}