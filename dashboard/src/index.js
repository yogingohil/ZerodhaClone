import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./config";
import "./index.css";
import { SocketProvider } from "./SocketContext";
import { AuthProvider } from "./AuthContext";
import Home from "./components/Home";

// Intercept all Axios calls and replace hardcoded localhost:3002 with the dynamic API_URL
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost:3002')) {
    config.url = config.url.replace('http://localhost:3002', API_URL);
  }
  return config;
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);