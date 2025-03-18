import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    // Fetch desired item details
    const fetchDesiredItem = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/items/getItem/${itemId}`
        );
        console.log("Desired item response:", res.data);
        console.log("Desired item images:", res.data.images);
        setDesiredItem(res.data);
      } catch (error) {
        setError("Failed to load item details");
      }
    };

    // Fetch user's items
    const fetchMyItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMyItems(res.data.items);
      } catch (error) {
        console.error("Error fetching items:", error);
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
        "http://localhost:5000/api/swap",
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
        // Only update if the updated item matches the desired item
        if (updatedItem._id === itemId) {
          setDesiredItem(updatedItem);
        }
        // Optionally update myItems if any of the user’s items are updated
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
    <div className="swap-container">
      <div className="logo" style={{ marginBottom: "20px" }}>
        <Link to="/">
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: "150px", height: "100px" }}
          />
        </Link>
      </div>
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Sending swap request...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="error-message"
          style={{
            color: "red",
            margin: "20px 0",
            padding: "10px",
            border: "1px solid red",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* Selected Item to Receive */}
      <div className="selected-item-section">
        <h2 style={{ color: "black" }}>You're swapping for:</h2>
        {desiredItem ? (
          <div className="selected-item-card">
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

            <div className="item-details">
              <h3>{desiredItem.title}</h3>
              <div className="item-meta">
                <span className="condition-badge">{desiredItem.category}</span>
                {desiredItem.bookType !== "" && (
                  <span className="condition-badge">{desiredItem.bookType}</span>
                )}
                <p>{desiredItem.description}</p>
                <span className="owner">
                  Posted by: {desiredItem.user?.fullname}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading item details...</p>
        )}
      </div>

      {/* Items to Offer */}
      <div className="offer-section">
        <h2 style={{ color: "black" }}>Select your item to offer:</h2>
        <div className="items-grid">
          {myItems.map((item) => (
            <div
              key={item._id}
              className={`item-card ${
                selectedItem?._id === item._id ? "selected" : ""
              }`}
              onClick={() => setSelectedItem(item)}
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

              <div className="item-info">
                <h4>{item.title}</h4>
                <div className="item-meta">
                  <span className="condition-badge">{item.category}</span>
                  {item.bookType !== "" && (
                    <span className="condition-badge">{item.bookType}</span>
                  )}
                </div>
                <p>{item.description}</p>
                <button
                  className="confirm-button"
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
      </div>
    </div>
  );
}

export default OfferSwap;
