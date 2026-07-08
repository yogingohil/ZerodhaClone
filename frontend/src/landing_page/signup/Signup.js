import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { API_URL, DASHBOARD_URL } from "../../config";
import "./Signup.css";

function Signup() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post(`${API_URL}/signup`, formData);
            setMessage("Signup successful! Welcome to Zerodha Clone.");
            login(response.data.user); // Auto-login after signup
            setFormData({ name: "", email: "", password: "", phone: "" });
            // Redirect to dashboard app after successful signup and pass the email for sync
            window.location.replace(`${DASHBOARD_URL}/?email=${encodeURIComponent(response.data.user.email)}`);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred during signup. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-form">
                <h1>Create Your Account</h1>
                <p>Join Zerodha Clone and start your trading journey</p>

                {message && (
                    <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                            minLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        className="signup-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="login-link">
                    <p>Already have an account? <a href="/login">Login here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;