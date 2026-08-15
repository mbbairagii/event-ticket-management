import React, { useState, useEffect } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';

function PaymentModal({ isOpen, onClose, amount, userId, onSuccess }) {
  const [step, setStep] = useState('input'); // input, processing, success
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError('');
      // Load Razorpay script if not already loaded
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
      // 1. Create order on backend
      const response = await createRazorpayOrder({ userId, amount });
      const orderData = response.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Eventified",
        description: "Event Ticket Booking",
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. Verify the signature server-side before trusting the payment.
          try {
            await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setStep('success');
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } catch (verifyErr) {
            setStep('input');
            setError('Payment verification failed. Please contact support if money was deducted.');
          }
        },
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3b82f6"
        },
        modal: {
          ondismiss: function() {
            setStep('input');
            setError('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setStep('input');
        setError(response.error.description || 'Payment failed');
      });
      rzp.open();
      
    } catch (err) {
      setStep('input');
      setError('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        
        {step === 'input' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 100 100">
                  <path d="M 15 30 L 85 30 C 85 40 95 40 95 50 C 95 60 85 60 85 70 L 15 70 C 15 60 5 60 5 50 C 5 40 15 40 15 30 Z" fill="var(--accent-primary)" />
                </svg>
                <h3 style={{ margin: 0 }}>Eventified Pay (Razorpay)</h3>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>

            {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <div style={{ background: 'var(--surface-light)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Total Amount to Pay</p>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>₹{amount.toFixed(2)}</h2>
            </div>

            <button onClick={handlePayment} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              Pay with Razorpay
            </button>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1.5rem auto' }}></div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Initializing Razorpay...</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Please do not close this window.</p>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: '#2ed573', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              margin: '0 auto 1.5rem auto', color: 'white', fontSize: '3rem'
            }}>
              ✓
            </div>
            <h3 style={{ color: '#2ed573', marginBottom: '0.5rem' }}>Payment Successful!</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Redirecting you to your bookings...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default PaymentModal;