import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import { useAuth } from "../AuthContext";

// import { holdings } from "../data/data";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchHoldingsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch holdings from database
      const holdingsResponse = await axios.get(`http://localhost:3002/allHoldings?userId=${user._id}`);
      let holdings = holdingsResponse.data;

      // Update holdings with live prices
      const updatedHoldings = await Promise.all(
        holdings.map(async (holding) => {
          try {
            // Try BSE first, fallback to NSE
            let response = await axios.get(`http://localhost:3002/api/stocks/${holding.name}?exchange=BSE`, { timeout: 3000 });
            
            // Handle both response formats (priceInfo or direct properties)
            const priceData = response.data.priceInfo || response.data;
            
            if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
              const currentPrice = priceData.lastPrice || priceData.quote?.lastPrice || holding.price;
              const previousClose = priceData.previousClose || priceData.quote?.previousClose || currentPrice;
              const change = currentPrice - previousClose;
              const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
              
              // Calculate net change percent (change from purchase price)
              const investmentPrice = holding.avg * holding.qty;
              const currentValue = currentPrice * holding.qty;
              const netChange = investmentPrice > 0 ? ((currentValue - investmentPrice) / investmentPrice) * 100 : 0;
              
              return {
                ...holding,
                price: currentPrice,
                day: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                net: `${netChange >= 0 ? '+' : ''}${netChange.toFixed(2)}%`,
                isLoss: change < 0
              };
            }
          } catch (bseError) {
            // Fallback to NSE
            try {
              let response = await axios.get(`http://localhost:3002/api/stocks/${holding.name}?exchange=NSE`, { timeout: 3000 });
              
              const priceData = response.data.priceInfo || response.data;
              
              if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
                const currentPrice = priceData.lastPrice || priceData.quote?.lastPrice || holding.price;
                const previousClose = priceData.previousClose || priceData.quote?.previousClose || currentPrice;
                const change = currentPrice - previousClose;
                const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
                
                // Calculate net change percent (change from purchase price)
                const investmentPrice = holding.avg * holding.qty;
                const currentValue = currentPrice * holding.qty;
                const netChange = investmentPrice > 0 ? ((currentValue - investmentPrice) / investmentPrice) * 100 : 0;
                
                return {
                  ...holding,
                  price: currentPrice,
                  day: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                  net: `${netChange >= 0 ? '+' : ''}${netChange.toFixed(2)}%`,
                  isLoss: change < 0
                };
              }
            } catch (nseError) {
              console.warn(`Could not fetch live data for ${holding.name}:`, nseError.message);
            }
          }
          
          // Return with default values if fetch fails
          return {
            ...holding,
            price: holding.price || 0,
            day: holding.day || '0.00%',
            net: holding.net || '0.00%'
          };
        })
      );

      setAllHoldings(updatedHoldings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHoldingsData();

    // Set up interval to fetch live data every 30 seconds
    const interval = setInterval(fetchHoldingsData, 30000);

    return () => clearInterval(interval);
  }, [fetchHoldingsData]);

  // Calculate summary values
  const totalInvestment = allHoldings.reduce((sum, stock) => sum + (stock.avg * stock.qty), 0);
  const currentValue = allHoldings.reduce((sum, stock) => sum + (stock.price * stock.qty), 0);
  const totalPnL = currentValue - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  return (
    <>
      <h3 className="title">
        Holdings ({allHoldings.length}) {loading && <span className="loading">⟳</span>}
      </h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>Net chg.</th>
            <th>Day chg.</th>
          </tr>

          {allHoldings.map((stock, index) => {
            const curValue = stock.price * stock.qty;
            const isProfit = curValue - stock.avg * stock.qty >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = stock.isLoss ? "loss" : "profit";

            return (
              <tr key={index}>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td>{curValue.toFixed(2)}</td>
                <td className={profClass}>
                  {(curValue - stock.avg * stock.qty).toFixed(2)}
                </td>
                <td className={profClass}>{stock.net}</td>
                <td className={dayClass}>{stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            {totalInvestment.toFixed(2)}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {currentValue.toFixed(2)}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalPnL >= 0 ? "profit" : "loss"}>
            {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} ({totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={allHoldings} />
    </>
  );
};

export default Holdings;