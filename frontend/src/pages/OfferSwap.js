import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function OfferSwap() {
  const [myItems, setMyItems] = useState([]);
  const { itemId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/items/user", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setMyItems(res.data.items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  const handleOffer = async (selectedItemId) => {
    try {
      await axios.post("http://localhost:5000/api/swap", { offeredItem: selectedItemId, desiredItem: itemId }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      navigate("/requests");
    } catch (error) {
      alert("Failed to send request.");
    }
  };

  return (
    <div>
      <h2>Select Your Item to Swap</h2>
      <div className="product-list">
        {myItems.map(item => (
          <div key={item._id} className="product-card" onClick={() => handleOffer(item._id)}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfferSwap;