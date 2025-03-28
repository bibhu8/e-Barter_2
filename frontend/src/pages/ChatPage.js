// src/pages/ChatPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import ChatList from "./ChatList";

function ChatConversation({ socket, chatId }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = localStorage.getItem("userId") || null;
  const backendURL = process.env.REACT_APP_BACKEND_URL || "";

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleChatDeleted = () => {
      setChat(null);
      setMessages([]);
    };

    const fetchChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendURL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChat(res.data.chat);
        setMessages(res.data.chat.messages || []);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();
    socket.emit("join-chat", chatId);

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:deleted", handleChatDeleted);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:deleted", handleChatDeleted);
      socket.emit("leave-chat", chatId);
    };
  }, [socket, chatId, backendURL]);

  // For alignment: check if message sender == userId
  const getSenderId = (msg) => {
    if (!msg.sender) return null;
    if (typeof msg.sender === "object") return msg.sender._id?.toString();
    return msg.sender; // if string
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat:message", {
      chatId,
      content: input,
      senderId: userId,
    });
    setInput("");
  };

  // Optional: partner name for conversation header
  const getPartnerName = (participants) => {
    if (!Array.isArray(participants)) return "Chat";
    const partner = participants.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== userId;
    });
    if (partner && typeof partner === "object" && partner.fullname) {
      return partner.fullname;
    }
    return "Chat";
  };

  const partnerName = chat ? getPartnerName(chat.participants) : "Chat";

  return (
    <div className="chat-container" style={{ padding: "10px" }}>
      <div className="chat-header">
        <h2>{partnerName}</h2>
      </div>
      <div className="chat-messages" style={{ height: "60vh", overflowY: "auto" }}>
        {messages.map((msg, idx) => {
          const senderId = getSenderId(msg);
          const isMyMessage = senderId === userId;
          return (
            <div
              key={idx}
              className={`chat-message ${isMyMessage ? "sent" : "received"}`}
              style={{
                textAlign: isMyMessage ? "right" : "left",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: isMyMessage ? "#BDECB6" : "#ffffff",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input" style={{ marginTop: "10px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ width: "80%", padding: "5px" }}
        />
        <button onClick={sendMessage} style={{ padding: "5px 10px", marginLeft: "5px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

function ChatPage({ socket }) {
  // We read :chatId from the URL (e.g., /chat/123)
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState(null);

  // If we come here with a specific :chatId in the route,
  // let's set it as our selected chat.
  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, [chatId]);

  return (
    <div
      className="chat-page"
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#D5E5D5",
      }}
    >
      {/* Left side: ChatList */}
      <div
        className="chatlist-column"
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          backgroundColor: "#EEF1DA",
        }}
      >
        <header className="header" style={{ padding: "10px" }}>
          <div className="logo">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Logo"
                style={{ width: "150px", height: "100px" }}
              />
            </Link>
          </div>
        </header>
        <ChatList socket={socket} />
      </div>

      {/* Right side: ChatConversation */}
      <div
        className="chat-conversation-column"
        style={{ width: "70%", overflowY: "auto" }}
      >
        {selectedChatId ? (
          <ChatConversation socket={socket} chatId={selectedChatId} />
        ) : (
          <div style={{ padding: "20px" }}>
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
