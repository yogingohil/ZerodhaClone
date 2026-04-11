import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1D');

  useEffect(() => {
    fetchChartData();
  }, [symbol, timeframe]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      // For now, we'll simulate chart data since we don't have historical API
      // In a real implementation, you'd fetch from NSE/BSE historical data API
      const mockData = generateMockChartData(timeframe);
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = (tf) => {
    const points = tf === '1D' ? 24 : tf === '1W' ? 7 : 30;
    const data = [];
    let price = 100; // Base price

    for (let i = 0; i < points; i++) {
      price += (Math.random() - 0.5) * 10; // Random price movement
      data.push(price);
    }

    return {
      labels: Array.from({ length: points }, (_, i) => {
        if (tf === '1D') return `${i}:00`;
        if (tf === '1W') return `Day ${i + 1}`;
        return `Day ${i + 1}`;
      }),
      datasets: [
        {
          label: `${symbol} Price`,
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${symbol} Analytics`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>{symbol} Analytics</h2>
        <div className="timeframe-buttons">
          <button
            className={timeframe === '1D' ? 'active' : ''}
            onClick={() => setTimeframe('1D')}
          >
            1D
          </button>
          <button
            className={timeframe === '1W' ? 'active' : ''}
            onClick={() => setTimeframe('1W')}
          >
            1W
          </button>
          <button
            className={timeframe === '1M' ? 'active' : ''}
            onClick={() => setTimeframe('1M')}
          >
            1M
          </button>
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="loading">Loading chart data...</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

      <div className="analytics-info">
        <div className="info-card">
          <h3>Technical Indicators</h3>
          <p>RSI: 65.4</p>
          <p>MACD: 1.23</p>
          <p>Moving Average (20): 98.5</p>
        </div>
        <div className="info-card">
          <h3>Volume</h3>
          <p>Today's Volume: 2,345,678</p>
          <p>Average Volume: 1,987,654</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;