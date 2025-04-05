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
              <i className="fa-brands fa-google"></i>
            </div>
            <div className="step-content">
              <h3>Sign in with Google</h3>
              <p>Easily sign in using your Google account. No need to remember another password!</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-camera"></i>
            </div>
            <div className="step-content">
              <h3>Post Your Item</h3>
              <p>Upload photos, add a description, and list the items you wish to swap.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-search"></i>
            </div>
            <div className="step-content">
              <h3>Browse & Explore</h3>
              <p>Discover a variety of items listed by other users in our community.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-repeat"></i>
            </div>
            <div className="step-content">
              <h3>Send a Swap Request</h3>
              <p>Found something you like? Send a swap request to the owner with just one click.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="step-content">
              <h3>Wait for Acceptance</h3>
              <p>The item owner reviews your request. Once accepted, you'll be notified.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-comments"></i>
            </div>
            <div className="step-content">
              <h3>Chat & Negotiate</h3>
              <p>
                When the request is accepted, the owner is directly taken to the chat page.
                You can navigate to your chat page anytime to finalize details.
              </p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-icon">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <div className="step-content">
              <h3>Complete the Swap</h3>
              <p>Once everything is agreed upon, complete your swap and enjoy your new item!</p>
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
