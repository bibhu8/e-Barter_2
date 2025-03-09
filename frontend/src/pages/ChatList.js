// src/pages/ChatList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ChatList({ socket }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        // Replace this endpoint with your actual chat API route if available.
        const response = await axios.get("/api/chats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  return (
    <div className="chatlist-container">
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat._id} className="chatlist-item">
            <Link to={`/chat/${chat._id}`}>
              <h3>{chat.name || "Chat Room"}</h3>
              <p>
                {chat.lastMessage
                  ? `Last message: ${chat.lastMessage}`
                  : "No messages yet."}
              </p>
            </Link>
          </div>
        ))
      ) : (
        <p>You have no active chats.</p>
      )}
    </div>
  );
}

export default ChatList;
