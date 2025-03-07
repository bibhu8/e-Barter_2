import React, { useEffect, useState } from "react";
import axios from "axios";

function Requests() {
  const [requests, setRequests] = useState([]);

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
      await axios.put(`/api/swap/${requestId}/accept`, {}, { 
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`
        } 
      });
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (error) {
      alert("Failed to accept request.");
    }
  };

  const handleReject = async (requestId) => {
    const message = prompt("Please enter a rejection message:");
    if (!message) return;

    try {
      await axios.put(`/api/swap/${requestId}/reject`, 
        { message },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`
          } 
        }
      );
      setRequests(requests.filter(req => req._id !== requestId));
      alert("Request rejected and message sent.");
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