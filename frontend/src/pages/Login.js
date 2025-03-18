import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user._id);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/");
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <Link to="/">
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: "150px", height: "100px" }}
            />
          </Link>
        </div>
        <div className="auth-buttons">
          <Link to="/signup" className="btn signup-btn">
            Sign Up
          </Link>
        </div>
      </header>

      <div className="auth-container">
        <div className="auth-form">
          <h2>Welcome Back</h2>
          <p>Please login to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="btn submit-btn">
              Login
            </button>

            {message.text && (
              <div className={`auth-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
