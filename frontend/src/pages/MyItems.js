import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function MyItems() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchItems = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/items/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data.items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchUser();
    fetchItems();
  }, []);

  const handleDelete = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.delete(`http://localhost:5000/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter(item => item._id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div>
      <header>
        <div className="logo">
          <Link to="/">Swap & Trade</Link>
        </div>
        <div className="auth-buttons">
          {user && <span>Welcome, {user.fullname}</span>}
        </div>
      </header>
      <main>
        <section className="hero">
          <h1>My Items</h1>
          <p>Items you have posted for exchange.</p>
        </section>
        <section className="products">
          <h2>Your Items</h2>
          <div className="product-grid">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div key={index} className="product-card">
                  <img src={item.images || "no-image.png"} alt={item.title} className="product-image img"/>
                  <div className="product-details">
                    <h3>{item.title}</h3>
                    <div className="item-meta">
                      <span className="condition-badge">{item.condition}</span>
                    </div>
                    <p>{item.description}</p>
                    <button onClick={() => handleDelete(item._id)} className="btn delete-btn">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No items available.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MyItems;