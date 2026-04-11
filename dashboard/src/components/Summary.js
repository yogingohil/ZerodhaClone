import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import "./Summary.css";

const Summary = () => {
  const { user } = useAuth();
  const [holdingsData, setHoldingsData] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSummaryData();
    }
  }, [user]);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);

      // Fetch holdings
      const holdingsResponse = await axios.get("http://localhost:3002/allHoldings");
      const holdings = holdingsResponse.data;

      // Calculate holdings summary
      const totalInvestment = holdings.reduce((sum, stock) => sum + (stock.avg * stock.qty), 0);
      const currentValue = holdings.reduce((sum, stock) => sum + (stock.price * stock.qty), 0);
      const totalPnL = currentValue - totalInvestment;
      const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

      setHoldingsData({
        count: holdings.length,
        totalInvestment,
        currentValue,
        totalPnL,
        totalPnLPercent
      });

      // Fetch orders count
      const ordersResponse = await axios.get(`http://localhost:3002/allOrders/${user._id}`);
      setOrdersCount(ordersResponse.data.length);

    } catch (error) {
      console.error("Error fetching summary data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate user ID like Kite (first letter of name + last 4 digits of user ID)
  const generateUserId = (name, id) => {
    if (!name || !id) return "USERID";
    const firstLetter = name.charAt(0).toUpperCase();
    const userId = id.slice(-4); // Last 4 characters of user ID
    return `${firstLetter}${userId}`;
  };

  return (
    <>
      <div className="username">
        <h6>Hi, {user?.name || 'User'}!</h6>
        <p className="user-id">User ID: {user ? generateUserId(user.name, user.id) : 'Loading...'}</p>
        <hr className="divider" />
      </div>

      {/* User Information Section - Like Kite */}
      <div className="section user-info">
        <span>
          <p>Account Information</p>
        </span>

        <div className="data">
          <div className="user-details">
            <div className="detail-row">
              <span className="label">Name:</span>
              <span className="value">{user?.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Email:</span>
              <span className="value">{user?.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Phone:</span>
              <span className="value">{user?.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="label">User ID:</span>
              <span className="value">{user ? generateUserId(user.name, user.id) : 'N/A'}</span>
            </div>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>3.74k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>0</span>{" "}
            </p>
            <p>
              Opening balance <span>3.74k</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdingsData ? holdingsData.count : 'Loading...'})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={holdingsData && holdingsData.totalPnL >= 0 ? "profit" : "loss"}>
              {holdingsData ? holdingsData.totalPnL.toFixed(2) : '0.00'}
              <small>
                {holdingsData ? `${holdingsData.totalPnLPercent >= 0 ? '+' : ''}${holdingsData.totalPnLPercent.toFixed(2)}%` : '+0.00%'}
              </small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{holdingsData ? holdingsData.currentValue.toFixed(2) : '0.00'}</span>{" "}
            </p>
            <p>
              Investment <span>{holdingsData ? holdingsData.totalInvestment.toFixed(2) : '0.00'}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Orders ({ordersCount})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{ordersCount}</h3>
            <p>Total Orders</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Pending Orders <span>0</span>{" "}
            </p>
            <p>
              Completed Orders <span>{ordersCount}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;