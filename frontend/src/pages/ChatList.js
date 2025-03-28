// src/pages/ChatList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ChatList({ socket }) {
  const [chats, setChats] = useState([]);
  const currentUserId = localStorage.getItem("userId") || null;
  const backendURL = process.env.REACT_APP_BACKEND_URL || "";

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${backendURL}/api/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [backendURL]);

  // Socket events: update or delete chat
  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (updatedChat) => {
      setChats((prevChats) => {
        // remove old version, place updated at top
        const filtered = prevChats.filter((c) => c._id !== updatedChat._id);
        return [updatedChat, ...filtered];
      });
    };

    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((c) => c._id !== chatId));
    };

    socket.on("chat:update", handleChatUpdate);
    socket.on("chat:deleted", handleChatDeleted);

    return () => {
      socket.off("chat:update", handleChatUpdate);
      socket.off("chat:deleted", handleChatDeleted);
    };
  }, [socket]);

  // Delete chat from user's perspective
  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Delete this chat for you?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${backendURL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        socket?.emit("delete-chat", chatId);
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
  };

  // Return the "other" participant's name
  const getPartnerName = (participants) => {
    if (!Array.isArray(participants) || participants.length === 0) {
      return "Chat Room";
    }
    // find participant who isn't currentUser
    const partner = participants.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== currentUserId;
    });
    if (partner && typeof partner === "object" && partner.fullname) {
      return partner.fullname;
    }
    return "Chat Room"; // fallback
  };

  return (
    <div className="chatlist-container" style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => {
          const chatName = getPartnerName(chat.participants);
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : "No messages yet.";

          return (
            <div key={chat._id} className="chatlist-item" style={{ borderBottom: "1px solid #ccc", padding: "10px" }}>
              <Link to={`/chat/${chat._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="chat-name" style={{ fontWeight: "bold" }}>
                  {chatName}
                </div>
                <div className="chat-last-message" style={{ fontSize: "0.9em", color: "#555" }}>
                  {lastMessage}
                </div>
              </Link>
              <button onClick={() => handleDeleteChat(chat._id)} style={{ marginTop: "5px" }}>
                Delete Chat
              </button>
            </div>
          );
        })
      ) : (
        <p>You have no active chats.</p>
      )}
    </div>
  );
}

export default ChatList;
