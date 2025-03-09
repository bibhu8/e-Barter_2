import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Home({socket}) {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [swapRequests, setSwapRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

    const handleNewItem = (newItem) => {
      setItems(prev => [newItem, ...prev]);
    };

    const handleDeletedItem = (deletedId) => {
      setItems(prev => prev.filter(item => item._id !== deletedId));
    };

    const handleUpdatedItem = (updatedItem) => {
      setItems(prev => prev.map(item => 
        item._id === updatedItem._id ? updatedItem : item
      ));
    };

    const handleNewSwapRequest = (newRequest) => {
      // Only add if relevant to current user
      if (user && (
        newRequest.sender._id === user._id ||
        newRequest.receiver._id === user._id
      )) {
        setSwapRequests(prev => [newRequest, ...prev]);
      }
    };
    
    const handleDeletedRequest = (deletedId) => {
      setSwapRequests(prev => prev.filter(req => req._id !== deletedId));
    };

    const handleAcceptedSwap = (data) => {
      // Update items if needed
      handleUpdatedItem(data.offeredItem);
      handleUpdatedItem(data.desiredItem);
      // Remove accepted request
      setSwapRequests(prev => prev.filter(req => req._id !== data.requestId));
    };

    useEffect(() => {
      if (!socket) {
        return; // Ensure socket is not null or undefined before setting up listeners
      }
      socket.on("chat:start", (data) => {
        navigate(`/chat/${data._id}`);
      });
      socket.on('item:create', handleNewItem);
      socket.on('item:delete', handleDeletedItem);
      socket.on('item:update', handleUpdatedItem);
      socket.on('swapRequest:create', handleNewSwapRequest);
      socket.on('swapRequest:delete', handleDeletedRequest);
      socket.on('swap:accepted', handleAcceptedSwap);
    
      return () => {
        // Clean up the socket listeners when the component unmounts
        socket.off('item:create', handleNewItem);
        socket.off('item:delete', handleDeletedItem);
        socket.off('item:update', handleUpdatedItem);
        socket.off('swapRequest:create', handleNewSwapRequest);
        socket.off('swapRequest:delete', handleDeletedRequest);
        socket.off('swap:accepted', handleAcceptedSwap);
        socket.off("chat:start");
      };
    }, [socket, user, navigate]);
    

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          const itemsRes = await axios.get("http://localhost:5000/api/items/getItem");
          console.log(itemsRes.data.items); // Log items to see if they are fetched correctly
          setItems(itemsRes.data.items);
          return;
        }

        const [userRes, requestsRes, itemsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/swap", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/items/otheruser", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setUser(userRes.data);
        // Emit 'join' event with user ID
    if (socket) {
      socket.emit("join", userRes.data._id);
    }
        setSwapRequests(requestsRes.data);
        setItems(itemsRes.data.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

const sentRequests = swapRequests.filter(req => req.sender._id === user?._id);
const receivedRequests = swapRequests.filter(req => req.receiver._id === user?._id);

/*  const handleAccept = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/swap/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const [requestsRes, itemsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/swap", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/items/otheruser", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      setSwapRequests(requestsRes.data);
      setItems(itemsRes.data.items);
    } catch (error) {
      alert("Failed to accept request.");
    }
  };
  */

  // Home.js - handleAccept (simplified)
const handleAccept = async (requestId) => {
  try {
    await axios.put(
      `http://localhost:5000/api/swap/${requestId}/accept`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    // Remove the Promise.all fetching here
  } catch (error) {
    alert("Failed to accept request.");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/swap/${requestId}/reject`, // Added full URL
        {},
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );
      // Fixed state variable name
      setSwapRequests(swapRequests.filter(req => req._id !== requestId));
      alert("Request rejected and message sent.");
    } catch (error) {
      alert("Failed to reject request.");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/swap/${requestId}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      setSwapRequests(swapRequests.filter(req => req._id !== requestId));
    } catch (error) {
      alert("Failed to delete request");
    }
  };

  const renderSwapRequests = () => (
    <section className="swap-requests">
      <div className="requests-section">
        <div className="sent-requests">
          <h3>Your Offers</h3>
          {sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <div key={request._id} className="request-card">
                <p>You offered: {request.offeredItem.title}</p>
                <p>For: {request.desiredItem.title}</p>
                <span>Status: {request.status}</span>
                <br></br>
                {request.status === 'rejected' && (
                <button 
                  onClick={() => handleDeleteRequest(request._id)}
                  className="btn delete-btn"
                >
                  Delete
                </button>
                )}
              </div>
            ))
          ) : <p>No sent requests</p>}
        </div>

        <div className="received-requests">
          <h3>Offers Received</h3>
          {receivedRequests.length > 0 ? (
            receivedRequests.map((request) => (
              <div key={request._id} className="request-card">
                <p>{request.sender.fullname} offers: {request.offeredItem.title}</p>
                <p>For your: {request.desiredItem.title}</p>
                {request.status === "pending" && (
                  <div>
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="btn accept-btn"
                  >
                    Accept Swap
                  </button>
                  <button 
                  onClick={() => handleReject(request._id)}
                  className="btn reject-btn"
                >
                  Reject
                </button>
                </div>
                )}
              </div>
            ))
          ) : <p>No received requests</p>}
        </div>
      </div>
    </section>
  );

  return (
    <div>
      <header>
        <div className="logo">
          <Link to="/">Swap & Trade</Link>
        </div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span>Welcome, {user.fullname}</span>
              <button 
                className="btn requests-btn"
                onClick={() => setShowRequests(true)}
              >
                Requests
              </button>
              <button onClick={handleLogout} className="btn">Logout</button>
              <Link to="/post-item" className="btn">Post Item</Link>
              <Link to="/my-items" className="btn">My Items</Link>
              <Link to="/chat" className="btn">Chats</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/signup" className="btn">Sign Up</Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>Swap & Trade</h1>
          <p>Exchange items with ease.</p>
        </section>

        <section className="products">
          <h2>Available for Exchange</h2>
          <div className="product-grid">
            {items.length > 0 ? (
              items.map((item) => (
                <div key={item._id} className="product-card">
                  <img src={item.images || "no-image.png"} alt={item.title} className="product-image" />
                  <div className="product-details">
                    <h3>{item.title}</h3>
                       <div className="item-meta">
                      <span className="condition-badge">{item.condition}</span>
                      {item.user && (
                        <span className="posted-by">Posted by: {item.user.fullname}</span>
                      )}
                    </div>
                    <p>{item.description}</p>
                    {user && (
                       <Link to={`/offer-swap/${item._id}`} className="btn swap-btn">
                         Offer Swap
                       </Link>
                     )}
                  </div>
                </div>
              ))
            ) : (
              <p>No items available.</p>
            )}
          </div>
        </section>
      </main>

      {showRequests && (
        <div className="requests-modal" onClick={() => setShowRequests(false)}>
          <div className="requests-content" onClick={(e) => e.stopPropagation()}>
            <div className="requests-header">
              <h2>Swap Requests</h2>
              <button className="close-btn" onClick={() => setShowRequests(false)}>
                &times;
              </button>
            </div>
            {renderSwapRequests()}
          </div>
        </div>
      )}                
    </div>
  );
}

export default Home;