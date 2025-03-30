// src/pages/ChatList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ChatList({ socket }) {
  const [chats, setChats] = useState([]);
  const currentUserId = localStorage.getItem("userId");
  const backendURL = process.env.REACT_APP_BACKEND_URL || "";

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendURL}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched chats:", response.data.chats);
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, [backendURL]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (updatedChat) => {
      setChats((prevChats) => {
        const filtered = prevChats.filter((chat) => chat._id !== updatedChat._id);
        return [updatedChat, ...filtered];
      });
    };

    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
    };

    socket.on("chat:update", handleChatUpdate);
    socket.on("chat:deleted", handleChatDeleted);

    return () => {
      socket.off("chat:update", handleChatUpdate);
      socket.off("chat:deleted", handleChatDeleted);
    };
  }, [socket]);

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Delete this chat for you?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${backendURL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (socket) {
          socket.emit("delete-chat", chatId);
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  // Updated function: filter out the current user's id and return the partner's name
  const getPartnerName = (participants) => {
    if (!Array.isArray(participants)) return "Chat Room";
    const otherParticipants = participants.filter((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== currentUserId;
    });
    if (otherParticipants.length > 0) {
      const partner = otherParticipants[0];
      return typeof partner === "object" && partner.fullname ? partner.fullname : partner;
    }
    return "Chat Room";
  };

  return (
    <div className="chatlist-container" style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat._id}
            className="chatlist-item"
            style={{ borderBottom: "1px solid #ccc", padding: "10px" }}
          >
            <Link to={`/chat/${chat._id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="chat-name" style={{ fontWeight: "bold" }}>
                {getPartnerName(chat.participants)}
              </div>
              <div className="chat-last-message" style={{ fontSize: "0.9em", color: "#555" }}>
                {chat.messages && chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1].content
                  : "No messages yet."}
              </div>
            </Link>
            <button onClick={() => handleDeleteChat(chat._id)} style={{ marginTop: "5px" }}>
              Delete Chat
            </button>
          </div>
        ))
      ) : (
        <p>You have no active chats.</p>
      )}
    </div>
  );
}

export default ChatList;
