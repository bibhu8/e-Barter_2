import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";

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
      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
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
              items.map((item) => (
                <div key={item._id} className="product-card">
                  {/* Use Swiper to display multiple images */}
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={10}
                    slidesPerView={1}
                  >
                    {item.images && Array.isArray(item.images) && item.images.length > 0 ? (
                      item.images.map((image, idx) => (
                        <SwiperSlide key={idx}>
                          <img
                            src={image}
                            alt={`Slide ${idx}`}
                            className="product-image img"
                          />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                        <img
                          src="no-image.png"
                          alt="No image available"
                          className="product-image img"
                        />
                      </SwiperSlide>
                    )}
                  </Swiper>
                  <div className="product-details">
                    <h3>{item.title}</h3>
                    <div className="item-meta">
                      {item.category && (
                        <span className="condition-badge">
                          {item.category}
                        </span>
                      )}
                      {item.bookType && (
                        <span className="condition-badge">
                          {item.bookType}
                        </span>
                      )}
                    </div>
                    <p>{item.description}</p>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No items available.</p>
            )}
          </div>
        </section>
      </main>
      <footer>
                    <p>&copy; 2025 eBarter. All rights reserved.</p>
                    <div className="footer-links">
                      <Link to="/">Home</Link>
                      <Link to="#">About Us</Link>
                      <Link to="/how-it-works">How It Works</Link>
                      <Link to="#">Terms of Service</Link>
                      <Link to="#">Privacy Policy</Link>
                      <Link to="#">Contact Us</Link>
                    </div>
                  </footer>
    </div>
  );
}

export default MyItems;
