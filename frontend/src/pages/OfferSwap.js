import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
        <h2>You're swapping for:</h2>
        {desiredItem ? (
          <div className="selected-item-card">
            <img
              src={desiredItem.images || "no-image.png"}
              alt={desiredItem.title}
              className="item-image"
            />

            <div className="item-details">
              <h3>{desiredItem.title}</h3>
              <p>{desiredItem.description}</p>
              <div className="item-meta">
                <span className="condition">{desiredItem.condition}</span>
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
        <h2>Select your item to offer:</h2>
        <div className="items-grid">
          {myItems.map((item) => (
            <div
              key={item._id}
              className={`item-card ${
                selectedItem?._id === item._id ? "selected" : ""
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <img
                src={item.images || "no-image.png"}
                alt={item.title}
                className="item-image"
              />

              <div className="item-info">
                <h4>{item.title}</h4>
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
