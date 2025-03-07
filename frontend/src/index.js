import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PostItem from "./pages/PostItem";
import MyItems from "./pages/MyItems";
import "./styles/global.css";
import OfferSwap from "./pages/OfferSwap";
import Requests from "./pages/Requests";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/post-item" element={<PostItem />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/offer-swap/:itemId" element={<OfferSwap />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);