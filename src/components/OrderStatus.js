import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const [orderRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/order/${orderId}`),
        axios.get(`${API_BASE_URL}/payment/${orderId}`)
      ]);

      setOrder(orderRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      setError('Failed to fetch order details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="order-status">
      <h2>Order Status</h2>
      
      {order && (
          <div className="order-info">
            <h3>Order Information</h3>
            <div className="info-grid">
              <div><strong>Order ID:</strong> {order.order_id}</div>
              <div><strong>Amount:</strong> ₹{order.order_amount}</div>
              <div><strong>Currency:</strong> {order.order_currency}</div>
              <div><strong>Status:</strong> <span className={`status ${order.order_status.toLowerCase()}`}>{order.order_status}</span></div>
              <div><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</div>
              <div><strong>Customer ID:</strong> {order.customer_details.customer_id}</div>
              <div><strong>Customer Name:</strong> {order.customer_details.customer_name}</div>
              <div><strong>Customer Phone:</strong> {order.customer_details.customer_phone}</div>
            </div>
          </div>
      )}

      {payments && payments.length > 0 && (
        <div className="payments-info">
          <h3>Payment Details</h3>
          {payments.map((payment, index) => (
            <div key={index} className="payment-item">
              <div className="info-grid">
                <div><strong>Payment ID:</strong> {payment.cf_payment_id}</div>
                <div><strong>Amount:</strong> ₹{payment.payment_amount}</div>
                <div><strong>Method:</strong> {payment.payment_method}</div>
                <div><strong>Status:</strong> <span className={`status ${payment.payment_status.toLowerCase()}`}>{payment.payment_status}</span></div>
                <div><strong>Gateway:</strong> {payment.payment_gateway}</div>
                <div><strong>Time:</strong> {new Date(payment.payment_time).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;