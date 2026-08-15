import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

declare var window: any; // Allow using window.Razorpay

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.css']
})
export class PaymentModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() amount: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  step: 'input' | 'processing' | 'success' = 'input';
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.step = 'input';
      this.error = '';
      this.loadRazorpayScript();
    }
  }

  loadRazorpayScript() {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  handleClose() {
    this.close.emit();
  }

  handlePayment() {
    this.step = 'processing';
    this.error = '';

    this.apiService.createRazorpayOrder({ amount: this.amount }).subscribe({
      next: (orderData) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Eventified",
          description: "Event Ticket Booking",
          order_id: orderData.orderId,
          handler: (response: any) => {
            this.step = 'success';
            setTimeout(() => {
              this.success.emit();
            }, 1500);
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
            ondismiss: () => {
              this.step = 'input';
              this.error = 'Payment cancelled';
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          this.step = 'input';
          this.error = response.error.description || 'Payment failed';
        });
        rzp.open();
      },
      error: (err) => {
        this.step = 'input';
        this.error = 'Failed to initiate payment. Please try again.';
      }
    });
  }
}
