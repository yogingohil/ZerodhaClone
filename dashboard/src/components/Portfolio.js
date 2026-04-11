import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import { useAuth } from "../AuthContext";
import "./Portfolio.css";

const Portfolio = () => {
  const { user } = useAuth();
  const [allHoldings, setAllHoldings] = useState([]);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvestment: 0,
    currentValue: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
    dayChange: 0,
    dayChangePercentage: 0
  });

  useEffect(() => {
    if (user) {
      const fetchHoldingsWithPrices = async () => {
        try {
          const res = await axios.get(`http://localhost:3002/allHoldings?userId=${user._id}`);
          let holdings = res.data || [];

          // Update with live prices
          const updated = await Promise.all(
            holdings.map(async (h) => {
              try {
                let priceRes = await axios.get(`http://localhost:3002/api/stocks/${h.name}?exchange=BSE`);
                const priceData = priceRes.data.priceInfo || priceRes.data;
                if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
                  return { ...h, price: priceData.lastPrice || priceData.quote?.lastPrice };
                }
              } catch (e) {
                try {
                  let priceRes = await axios.get(`http://localhost:3002/api/stocks/${h.name}?exchange=NSE`);
                  const priceData = priceRes.data.priceInfo || priceRes.data;
                  if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
                    return { ...h, price: priceData.lastPrice || priceData.quote?.lastPrice };
                  }
                } catch (e2) {}
              }
              return h;
            })
          );
          setAllHoldings(updated);
          calculatePortfolioStats(updated);
        } catch (error) {
          console.error("Error fetching holdings:", error);
        }
      };
      fetchHoldingsWithPrices();
    }
  }, [user]);

  const calculatePortfolioStats = (holdings) => {
    let totalInvestment = 0;
    let currentValue = 0;
    let dayChange = 0;

    holdings.forEach((stock) => {
      const investment = stock.avg * stock.qty;
      const currentVal = stock.price * stock.qty;
      const dayChangePercent = stock.day ? parseFloat(stock.day.replace('%', '') || 0) / 100 : 0;

      totalInvestment += investment;
      currentValue += currentVal;
      dayChange += currentVal * dayChangePercent;
    });

    const totalPnL = currentValue - totalInvestment;
    const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
    const dayChangePercentage = currentValue > 0 ? (dayChange / currentValue) * 100 : 0;

    setPortfolioStats({
      totalInvestment,
      currentValue,
      totalPnL,
      totalPnLPercentage,
      dayChange,
      dayChangePercentage
    });
  };

  // Pass holdings array directly to VerticalGraph - it will format the chart data

  return (
    <>
      <h3 className="title">Portfolio Overview</h3>

      <div className="portfolio-stats">
        <div className="stat-card">
          <h4>Total Investment</h4>
          <p className="value">₹{portfolioStats.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <h4>Current Value</h4>
          <p className="value">₹{portfolioStats.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
        <div className={`stat-card ${portfolioStats.totalPnL >= 0 ? 'profit' : 'loss'}`}>
          <h4>Total P&L</h4>
          <p className="value">
            ₹{portfolioStats.totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            ({portfolioStats.totalPnLPercentage >= 0 ? '+' : ''}{portfolioStats.totalPnLPercentage.toFixed(2)}%)
          </p>
        </div>
        <div className={`stat-card ${portfolioStats.dayChange >= 0 ? 'profit' : 'loss'}`}>
          <h4>Day's Change</h4>
          <p className="value">
            ₹{portfolioStats.dayChange.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            ({portfolioStats.dayChangePercentage >= 0 ? '+' : ''}{portfolioStats.dayChangePercentage.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="portfolio-chart">
        <h4>Portfolio Composition</h4>
        {allHoldings && allHoldings.length > 0 ? (
          <VerticalGraph data={allHoldings} />
        ) : (
          <p>No holdings data available</p>
        )}
      </div>

      <div className="holdings-breakdown">
        <h4>Holdings Breakdown</h4>
        <div className="holdings-table">
          <table>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Quantity</th>
                <th>Avg Price</th>
                <th>Current Price</th>
                <th>Investment</th>
                <th>Current Value</th>
                <th>P&L</th>
                <th>P&L %</th>
              </tr>
            </thead>
            <tbody>
              {allHoldings.map((stock, index) => {
                const investment = stock.avg * stock.qty;
                const currentValue = stock.price * stock.qty;
                const pnl = currentValue - investment;
                const pnlPercentage = investment > 0 ? (pnl / investment) * 100 : 0;

                return (
                  <tr key={index}>
                    <td>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>₹{stock.avg.toFixed(2)}</td>
                    <td>₹{stock.price.toFixed(2)}</td>
                    <td>₹{investment.toFixed(2)}</td>
                    <td>₹{currentValue.toFixed(2)}</td>
                    <td className={pnl >= 0 ? 'profit' : 'loss'}>
                      ₹{pnl.toFixed(2)}
                    </td>
                    <td className={pnl >= 0 ? 'profit' : 'loss'}>
                      {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Portfolio;