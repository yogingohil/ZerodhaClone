import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { SocketProvider } from "./SocketContext";
import { AuthProvider } from "./AuthContext";
import { DASHBOARD_URL } from "./config";

import HomePage from "./landing_page/home/HomePage";
import Signup from "./landing_page/signup/Signup";
import Login from "./landing_page/signup/Login";
import AboutPage from "./landing_page/about/AboutPage";
import ProductPage from "./landing_page/products/ProductsPage";
import PricingPage from "./landing_page/pricing/PricingPage";
import SupportPage from "./landing_page/support/SupportPage";

import NotFound from "./landing_page/NotFound";
import Navbar from "./landing_page/Navbar";
import Footer from "./landing_page/Footer";

// Dashboard redirect component
const DashboardRedirect = () => {
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const email = storedUser ? JSON.parse(storedUser).email : null;
    const targetUrl = email
      ? `${DASHBOARD_URL}/?email=${encodeURIComponent(email)}`
      : DASHBOARD_URL;

    window.location.replace(targetUrl);
  }, []);
  return <div>Redirecting to dashboard...</div>;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <SocketProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);