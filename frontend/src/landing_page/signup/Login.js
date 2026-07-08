import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../AuthContext";
import { API_URL, DASHBOARD_URL } from "../../config";
import "./Login.css";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
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
            const response = await axios.post(`${API_URL}/login`, formData);
            setMessage("Login successful! Welcome back.");
            login(response.data.user); // Update auth context
            // Redirect to dashboard app after successful login and pass the email for sync
            window.location.replace(`${DASHBOARD_URL}/?email=${encodeURIComponent(response.data.user.email)}`);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage("An error occurred during login. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Welcome Back</h1>
                <p>Sign in to your Zerodha Clone account</p>

                {message && (
                    <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="signup-link">
                    <p>Don't have an account? <a href="/signup">Sign up here</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;