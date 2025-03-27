import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper";

function OfferSwap({ socket }) {
  const [myItems, setMyItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [desiredItem, setDesiredItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { itemId } = useParams();
  const navigate = useNavigate();

  // ExpandableText component remains the same
  const ExpandableText = ({ text }) => {
    const [clamped, setClamped] = useState(true);
    const shouldShowToggle = text.length > 100; // Adjust threshold if needed

    return (
      <div className="expandable-text-container">
        <div className={`text-content ${clamped ? "line-clamp" : ""}`}>
          {text}
        </div>
        {shouldShowToggle && (
          <button className="toggle-btn" onClick={() => setClamped(!clamped)}>
            {clamped ? "Show More" : "Show Less"}
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    // Fetch desired item details
    const fetchDesiredItem = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/items/getItem/${itemId}`
        );
        setDesiredItem(res.data);
      } catch (error) {
        setError("Failed to load item details");
      }
    };

    // Fetch user's items
    const fetchMyItems = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/items/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMyItems(res.data.items);
      } catch (error) {
        setError("Failed to load your items");
      }
    };

    fetchDesiredItem();
    fetchMyItems();
  }, [itemId]);

  const handleOffer = async (offeredItemId) => {
    try {
      setLoading(true);
      setError("");
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/swap`,
        { offeredItem: offeredItemId, desiredItem: itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to send swap request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      const handleItemUpdate = (updatedItem) => {
        // Update desired item if it matches
        if (updatedItem._id === itemId) {
          setDesiredItem(updatedItem);
        }
        // Update user's items if necessary
        setMyItems((prev) =>
          prev.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );
      };

      socket.on("item:update", handleItemUpdate);
      return () => socket.off("item:update", handleItemUpdate);
    }
  }, [socket, itemId]);

  return (
    <div className="swap-container" style={{ background: "#ADB2D4" }}>
      <div className="logo" style={{ marginBottom: "20px"}}>
        <Link to="/">
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: "150px", height: "100px" }}
          />
        </Link>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Sending swap request...</p>
        </div>
      )}

      {error && (
        <div className="error-message" style={{ margin: "20px 0" }}>
          {error}
        </div>
      )}

      {/* Desired Item Section */}
      <section className="products" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "black", textAlign: "center" }}>
          You're swapping for:
        </h2>
        {desiredItem ? (
          <div
            className="product-card"
            style={{ margin: "0 auto", maxWidth: "300px" }}
          >
            {desiredItem.images ? (
              Array.isArray(desiredItem.images) ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="product-image-swiper"
                >
                  {desiredItem.images.map((image, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={image}
                        alt={`${desiredItem.title} - ${idx}`}
                        className="product-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src={desiredItem.images}
                  alt={desiredItem.title}
                  className="product-image"
                />
              )
            ) : (
              <img
                src="no-image.png"
                alt="No image available"
                className="product-image"
              />
            )}

            <div className="product-details">
              <h4>{desiredItem.title}</h4>
              <div className="item-meta">
                <span className="condition-badge">{desiredItem.category}</span>
                {desiredItem.bookType !== "" && (
                  <span className="condition-badge">
                    {desiredItem.bookType}
                  </span>
                )}
              </div>
              <ExpandableText text={desiredItem.description} />
              <span className="posted-by">
                Posted by: {desiredItem.user?.fullname}
              </span>
            </div>
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>Loading item details...</p>
        )}
      </section>

      {/* My Items Section */}
      <section className="offer-section">
        <h2 style={{ color: "black", textAlign: "center" }}>
          Select your item to offer:
        </h2>
        <div className="product-grid">
          {myItems.map((item) => (
            <div
              key={item._id}
              className={`product-card ${
                selectedItem?._id === item._id ? "selected" : ""
              }`}
              onClick={() => setSelectedItem(item)}
              style={{ cursor: "pointer" }}
            >
              {Array.isArray(item.images) && item.images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                  className="product-image-swiper"
                >
                  {item.images.map((image, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={image}
                        alt={`${item.title} - ${idx}`}
                        className="product-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src={item.images || "no-image.png"}
                  alt={item.title}
                  className="product-image"
                />
              )}
              <div className="product-details">
                <h4>{item.title}</h4>
                <div className="item-meta">
                  <span className="condition-badge">{item.category}</span>
                  {item.bookType !== "" && (
                    <span className="condition-badge">{item.bookType}</span>
                  )}
                </div>
                <ExpandableText text={item.description} />
                <button
                  className="btn confirm-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOffer(item._id);
                  }}
                  disabled={selectedItem?._id !== item._id}
                >
                  Offer This Item
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default OfferSwap;
