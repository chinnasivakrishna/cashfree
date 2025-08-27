import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    orderNote: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!formData.customerPhone.trim() || formData.customerPhone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderData = {
        amount: parseFloat(formData.amount),
        currency: 'INR',
        customerDetails: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
        },
        orderNote: formData.orderNote || 'Payment for order'
      };

      const response = await axios.post(`${API_BASE_URL}/create-order`, orderData);
      
      if (response.data.success) {
        const { order } = response.data;
        
        // Load Cashfree SDK and initiate payment
        initiatePayment(order);
      } else {
        setError('Failed to create order');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = (order) => {
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'; // Production SDK
    // For sandbox: 'https://sdk.cashfree.com/js/ui/beta/cashfree.sandbox.js'
    script.async = true;
    
    script.onload = () => {
      const cashfree = window.Cashfree({
        mode: 'production', // Change to 'sandbox' for testing
      });

      const checkoutOptions = {
        paymentSessionId: order.payment_session_id,
        returnUrl: `${window.location.origin}/payment/callback`,
        redirectTarget: '_self'
      };

      cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          console.error('Payment error:', result.error);
          setError(result.error.message || 'Payment failed');
        }
      });
    };

    script.onerror = () => {
      setError('Failed to load payment SDK');
    };

    document.head.appendChild(script);
  };

  return (
    <div className="payment-form-container">
      <div className="payment-form">
        <h2>Make a Payment</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount (₹) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              step="0.01"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerPhone">Phone Number *</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="orderNote">Order Note</label>
            <textarea
              id="orderNote"
              name="orderNote"
              value={formData.orderNote}
              onChange={handleChange}
              placeholder="Enter order description"
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="payment-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;