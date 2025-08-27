import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState('loading');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      setError('Invalid payment callback - Order ID missing');
      setPaymentStatus('error');
      return;
    }

    verifyPayment(orderId);
  }, [searchParams]);

  const verifyPayment = async (orderId) => {
    try {
      // Get order details
      const orderResponse = await axios.get(`${API_BASE_URL}/order/${orderId}`);
      const order = orderResponse.data;
      
      // Get payment details
      const paymentResponse = await axios.get(`${API_BASE_URL}/payment/${orderId}`);
      const payments = paymentResponse.data;
      
      setOrderDetails({ ...order, payments });
      
      if (order.order_status === 'PAID') {
        setPaymentStatus('success');
      } else if (order.order_status === 'EXPIRED' || order.order_status === 'CANCELLED') {
        setPaymentStatus('failed');
      } else {
        setPaymentStatus('pending');
      }
      
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Failed to verify payment status');
      setPaymentStatus('error');
    }
  };

  const handleRetryPayment = () => {
    navigate('/');
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="status-container loading">
            <div className="spinner"></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        );

      case 'success':
        return (
          <div className="status-container success">
            <div className="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            {orderDetails && (
              <div className="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                <p><strong>Amount:</strong> ₹{orderDetails.order_amount}</p>
                <p><strong>Status:</strong> {orderDetails.order_status}</p>
              </div>
            )}
            <button onClick={() => navigate('/')} className="primary-button">
              Make Another Payment
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="status-container failed">
            <div className="error-icon">❌</div>
            <h2>Payment Failed</h2>
            <p>Unfortunately, your payment could not be processed.</p>
            {orderDetails && (
              <div className="order-details">
                <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                <p><strong>Amount:</strong> ₹{orderDetails.order_amount}</p>
                <p><strong>Status:</strong> {orderDetails.order_status}</p>
              </div>
            )}
            <button onClick={handleRetryPayment} className="primary-button">
              Try Again
            </button>
          </div>
        );

      case 'pending':
        return (
          <div className="status-container pending">
            <div className="pending-icon">⏳</div>
            <h2>Payment Pending</h2>
            <p>Your payment is being processed. Please check back later.</p>
            {orderDetails && (
              <div className="order-details">
                <p><strong>Order ID:</strong> {orderDetails.order_id}</p>
                <p><strong>Amount:</strong> ₹{orderDetails.order_amount}</p>
                <p><strong>Status:</strong> {orderDetails.order_status}</p>
              </div>
            )}
            <button onClick={() => window.location.reload()} className="secondary-button">
              Refresh Status
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="status-container error">
            <div className="error-icon">⚠️</div>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="primary-button">
              Go Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="payment-callback">
      {renderPaymentStatus()}
    </div>
  );
};

export default PaymentCallback;