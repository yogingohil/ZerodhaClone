import React from "react";
import "./Apps.css";
import "./Apps.css";

const Apps = () => {
  const apps = [
    {
      name: "Console",
      description: "Advanced trading platform",
      icon: "📊",
      status: "Available"
    },
    {
      name: "Varsity",
      description: "Learn trading basics",
      icon: "🎓",
      status: "Available"
    },
    {
      name: "Coin",
      description: "Cryptocurrency trading",
      icon: "₿",
      status: "Coming Soon"
    },
    {
      name: "Kite Connect",
      description: "API for developers",
      icon: "🔌",
      status: "Available"
    },
    {
      name: "Sensex",
      description: "Index trading",
      icon: "📈",
      status: "Available"
    },
    {
      name: "Smallcase",
      description: "Thematic investing",
      icon: "📦",
      status: "Available"
    }
  ];

  return (
    <div className="apps-container">
      <h2 className="apps-title">Trading Apps & Tools</h2>
      <p className="apps-subtitle">Explore our suite of trading applications and tools</p>

      <div className="apps-grid">
        {apps.map((app, index) => (
          <div key={index} className="app-card">
            <div className="app-icon">{app.icon}</div>
            <h3 className="app-name">{app.name}</h3>
            <p className="app-description">{app.description}</p>
            <span className={`app-status ${app.status === 'Available' ? 'available' : 'coming-soon'}`}>
              {app.status}
            </span>
            {app.status === 'Available' && (
              <button className="app-btn">Open App</button>
            )}
          </div>
        ))}
      </div>

      <div className="apps-info">
        <h3>Why use our apps?</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Advanced Trading</h4>
            <p>Get access to advanced charting tools, technical indicators, and real-time market data.</p>
          </div>
          <div className="info-item">
            <h4>Learn & Grow</h4>
            <p>Access educational content and learn trading strategies from experienced traders.</p>
          </div>
          <div className="info-item">
            <h4>API Integration</h4>
            <p>Build your own trading applications using our powerful APIs and developer tools.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apps;