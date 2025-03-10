// src/pages/ChatList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ChatList({ socket }) {
  const [chats, setChats] = useState([]);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
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

  useEffect(() => {
    if (!socket) return;
  
    // When a chat is updated (e.g., new message), move it to the top
    const handleChatUpdate = (updatedChat) => {
      setChats((prevChats) => {
        const filtered = prevChats.filter(chat => chat._id !== updatedChat._id);
        return [updatedChat, ...filtered];
      });
    };
  
    // Listen for deletion events to remove chats from the list
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
        await axios.delete(`/api/chats/${chatId}`, {
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

  return (
    <div className="chatlist-container">
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => {
          // Determine the chat partner's name (the participant that is not the current user)
          let chatName = "Chat Room";
          if (chat.participants && Array.isArray(chat.participants)) {
            const partner = chat.participants.find((p) => {
              const pId = typeof p === "object" ? p._id.toString() : p;
              return pId !== currentUserId;
            });
            if (partner && typeof partner === "object" && partner.fullname) {
              chatName = partner.fullname;
            }
          }
          
          // Extract the last message content, if available
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : "No messages yet.";

          return (
            <div key={chat._id} className="chatlist-item">
              <Link to={`/chat/${chat._id}`}>
                <div className="chat-name" style={{ fontWeight: "bold" }}>
                  {chatName}
                </div>
                <div className="chat-last-message" style={{ fontSize: "0.9em", color: "#555" }}>
                  {lastMessage}
                </div>
              </Link>
              <button onClick={() => handleDeleteChat(chat._id)}>
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
