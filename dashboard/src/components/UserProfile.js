import React from "react";
import { useAuth } from "../AuthContext";
import "./UserProfile.css";

const UserProfile = () => {
  const { user } = useAuth();

  // Generate user ID like Kite
  const generateUserId = (name, id) => {
    if (!name || !id) return "USERID";
    const firstLetter = name.charAt(0).toUpperCase();
    const userId = id.slice(-4);
    return `${firstLetter}${userId}`;
  };

  if (!user) {
    return <div className="loading">Loading user information...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="avatar-large">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="user-basic-info">
          <h3>{user.name}</h3>
          <p className="user-id-display">{generateUserId(user.name, user.id)}</p>
          <p className="account-status">Active Account</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h4>Personal Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <span>{user.name}</span>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <span>{user.phone}</span>
            </div>
            <div className="info-item">
              <label>User ID</label>
              <span>{generateUserId(user.name, user.id)}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h4>Account Details</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Account Type</label>
              <span>Individual</span>
            </div>
            <div className="info-item">
              <label>Account Status</label>
              <span className="status-active">Active</span>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <span>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Exchange Access</label>
              <span>NSE, BSE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;