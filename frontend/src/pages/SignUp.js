import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function SignUp() {
  const [formData, setFormData] = useState({ fullname: "", email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      if (res.status === 201) {
        setMessage({ text: "Registration successful! Please login", type: "success" });
        navigate("/login");
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ text: "An error occurred", type: "error" });
    }
  };

  return (
    <div>
      <header>
        <div className="logo">
          <Link to="/">Swap & Trade</Link>
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="btn login-btn">Login</Link>
        </div>
      </header>
      
      <div className="auth-container">
        <div className="auth-form">
          <h2>Create Account</h2>
          <p>Start swapping your items today</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                onChange={handleChange}
                required
              />
            </div>
            
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
                placeholder="Create a password"
                onChange={handleChange}
                required
              />
              <small>At least 8 characters</small>
            </div>
            
            <div className="terms-agreement">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </label>
            </div>
            
            <button type="submit" className="btn submit-btn">Sign Up</button>
            
            {message.text && (
              <div className={`auth-message ${message.type}`}>{message.text}</div>
            )}
            
            <div className="auth-redirect">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;