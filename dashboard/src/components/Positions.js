import React, { useState, useEffect } from "react";
import axios from "axios";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositionsData();
    
    // Set up interval to fetch live data every 30 seconds
    const interval = setInterval(fetchPositionsData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPositionsData = async () => {
    setLoading(true);
    try {
      // Fetch positions from database
      const positionsResponse = await axios.get("http://localhost:3002/allPositions");
      let positions = positionsResponse.data || [];
      
      if (!positions || positions.length === 0) {
        setAllPositions([]);
        setLoading(false);
        return;
      }

      // Update positions with live prices
      const updatedPositions = await Promise.all(
        positions.map(async (position) => {
          try {
            // Try BSE first, fallback to NSE
            let response = await axios.get(`http://localhost:3002/api/stocks/${position.name}?exchange=BSE`);
            
            // Handle both response formats (priceInfo or direct properties)
            const priceData = response.data.priceInfo || response.data;
            
            if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
              const currentPrice = priceData.lastPrice || priceData.quote?.lastPrice || position.price;
              const previousClose = priceData.previousClose || priceData.quote?.previousClose || currentPrice;
              const change = currentPrice - previousClose;
              const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
              
              return {
                ...position,
                price: currentPrice,
                day: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                isLoss: change < 0
              };
            }
          } catch (bseError) {
            // Fallback to NSE
            try {
              let response = await axios.get(`http://localhost:3002/api/stocks/${position.name}?exchange=NSE`);
              
              const priceData = response.data.priceInfo || response.data;
              
              if (priceData && (priceData.lastPrice || priceData.quote?.lastPrice)) {
                const currentPrice = priceData.lastPrice || priceData.quote?.lastPrice || position.price;
                const previousClose = priceData.previousClose || priceData.quote?.previousClose || currentPrice;
                const change = currentPrice - previousClose;
                const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
                
                return {
                  ...position,
                  price: currentPrice,
                  day: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                  isLoss: change < 0
                };
              }
            } catch (nseError) {
              console.warn(`Could not fetch live data for ${position.name}:`, nseError.message);
            }
          }
          
          return position; // Return original if live data fetch fails
        })
      );

      setAllPositions(updatedPositions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setAllPositions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h3 className="title">
        Positions ({allPositions.length}) {loading && <span className="loading">⟳</span>}
      </h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Product</th>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg.</th>
            <th>LTP</th>
            <th>P&L</th>
            <th>Chg.</th>
          </tr>

          {allPositions.map((stock, index) => {
            const curValue = stock.price * stock.qty;
            const isProfit = curValue - stock.avg * stock.qty >= 0.0;
            const profClass = isProfit ? "profit" : "loss";
            const dayClass = stock.isLoss ? "loss" : "profit";

            return (
              <tr key={index}>
                <td>{stock.product}</td>
                <td>{stock.name}</td>
                <td>{stock.qty}</td>
                <td>{stock.avg.toFixed(2)}</td>
                <td>{stock.price.toFixed(2)}</td>
                <td className={profClass}>
                  {(curValue - stock.avg * stock.qty).toFixed(2)}
                </td>
                <td className={dayClass}>{stock.day}</td>
              </tr>
            );
          })}
        </table>
      </div>
    </>
  );
};

export default Positions;