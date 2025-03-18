import React from "react";
import { Link } from "react-router-dom";

function HowItWorks() {
  return (
    <div className="page">
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
          <Link to="/login" className="btn signup-btn">Login</Link>
          <Link to="/signup" className="btn signup-btn">Sign Up</Link>
        </div>
      </header>
      
      <main>
        <section className="how-it-works">
          <h1>How It Works</h1>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <div className="step-content">
              <h3>Create an Account</h3>
              <p>Sign up for free to start swapping items with our community.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-camera"></i>
            </div>
            <div className="step-content">
              <h3>Post Your Items</h3>
              <p>Upload photos and details of items you want to swap.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-handshake"></i>
            </div>
            <div className="step-content">
              <h3>Find & Negotiate</h3>
              <p>Browse items and connect with other users to arrange swaps.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer>
        <p>&copy; 2025 Swap & Trade. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
        </footer>
    </div>
  );
}

export default HowItWorks;