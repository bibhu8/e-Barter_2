import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Requests({socket}) {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
  const currentUserId = localStorage.getItem("userId");
  if (currentUserId) {
    socket.emit("join", currentUserId);
  }

  const handleCreatedSwapRequest = (newRequest) => {
    setRequests((prev) => [...prev, newRequest]);
  };

   const handleAcceptedSwap = (data) => {
      // If you receive a global "swap:accepted" event, you could update state accordingly
      setRequests((prev) =>
        prev.map((req) =>
          req._id === data.requestId ? { ...req, status: "accepted" } : req
        )
      );
    };

    const handleRejectedRequest = (rejectedRequest) => {
      setRequests(prev => prev.filter(req => req._id !== rejectedRequest._id));
    };

    const handleDeletedRequest = (deletedId) => {
      setRequests((prev) => prev.filter((req) => req._id !== deletedId));
    };

    // Listen for the chat start event
    const handleChatStart = (chatData) => {
      // Redirect to the chat page with a chat identifier.
      // Here we use the swap request id to identify the chat room.
      navigate(`/chat/${chatData._id}`);
    };

    socket.on("swapRequest:create", handleCreatedSwapRequest);
    socket.on("swap:accepted", handleAcceptedSwap);
    socket.on("swapRequest:reject", handleRejectedRequest);
    socket.on("swapRequest:delete", handleDeletedRequest);
    socket.on("chat:start", handleChatStart);

    return () => {
      socket.off("swapRequest:create", handleCreatedSwapRequest);
      socket.off("swap:accepted", handleAcceptedSwap);
      socket.off("swapRequest:reject", handleRejectedRequest);
      socket.off("swapRequest:delete", handleDeletedRequest);
      socket.off("chat:start", handleChatStart);
    };
  }, [socket]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/api/swap", { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          } 
        });
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      const res = await axios.put(
        `/api/swap/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}}
      );
      
      // Immediate redirect using response data
      if (res.data.chatId) {
        navigate(`/chat/${res.data.chatId}`);
      }
    } catch (error) {
      alert("Failed to accept request.");
    }
  };

  const handleReject = async (requestId) => {

    try {
      await axios.put(`/api/swap/${requestId}/reject`, 
        {},
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );
      setRequests(requests.filter(req => req._id !== requestId));
      alert("Request rejected");
    } catch (error) {
      alert("Failed to reject request.");
    }
  };

  return (
    <div>
      <h2>Your Swap Requests</h2>
      {requests.map(request => (
        <div key={request._id}>
          <p>Offered: {request.offeredItem.title}</p>
          <p>Desired: {request.desiredItem.title}</p>
          {request.receiver._id === localStorage.getItem("userId") && request.status === "pending" && (
            <div>
              <button onClick={() => handleAccept(request._id)}>Accept</button>
              <button 
                onClick={() => handleReject(request._id)}
                style={{ marginLeft: '10px', backgroundColor: '#ff4444' }}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Requests;