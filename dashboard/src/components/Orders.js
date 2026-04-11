import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user?._id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3002/allOrders/${user._id}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3002/cancelOrder/${orderId}`);
      // Refresh orders after cancellation
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  if (loading) {
    return <div className="orders">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <h3 className="title">Orders ({orders.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Type</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Status</th>
              <th>Order Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td>{order.name}</td>
                <td className={order.mode === "BUY" ? "buy" : "sell"}>
                  {order.mode}
                </td>
                <td>{order.qty}</td>
                <td>{order.price ? order.price.toFixed(2) : "Market"}</td>
                <td className={`status-${order.status.toLowerCase()}`}>
                  {order.status}
                </td>
                <td>{new Date(order.timestamp).toLocaleString()}</td>
                <td>
                  {order.status === "PENDING" && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;