import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function ChatList({ socket, onSelectChat, selectedChatId }) {
  const [chats, setChats] = useState([]);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendURL = process.env.REACT_APP_BACKEND_URL || "";
        const response = await axios.get(`${backendURL}/api/chats`, {
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

    const handleChatUpdate = (updatedChat) => {
      setChats((prevChats) => {
        const filtered = prevChats.filter((chat) => chat._id !== updatedChat._id);
        return [updatedChat, ...filtered];
      });
    };

    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      if (chatId === selectedChatId) {
        onSelectChat(null);
      }
    };

    socket.on("chat:update", handleChatUpdate);
    socket.on("chat:deleted", handleChatDeleted);

    return () => {
      socket.off("chat:update", handleChatUpdate);
      socket.off("chat:deleted", handleChatDeleted);
    };
  }, [socket, selectedChatId, onSelectChat]);

  const handleDeleteChat = async (chatId, event) => {
    event.stopPropagation();
    if (window.confirm("Delete this chat for you?")) {
      try {
        const token = localStorage.getItem("token");
        const backendURL = process.env.REACT_APP_BACKEND_URL || "";
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

  const getPartnerName = (participants) => {
    if (!Array.isArray(participants)) return "Chat Room";
    const partner = participants.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== currentUserId;
    });
    return partner?.fullname || "Chat Room";
  };

  return (
    <div className="chatlist-container" style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {Array.isArray(chats) && chats.length > 0 ? (
        chats.map((chat) => {
          if (!chat) return null;
          const chatName = getPartnerName(chat.participants);
          const lastMessage = chat.messages?.slice(-1)[0]?.content || "No messages yet.";
          const isActive = chat._id === selectedChatId;
          
          return (
            <div
              key={chat._id}
              className="chatlist-item"
              style={{
                background: isActive ? "#eee" : "transparent",
                cursor: "pointer",
                padding: "10px",
                borderBottom: "1px solid #ccc",
              }}
              onClick={() => onSelectChat(chat._id)}
            >
              <div style={{ fontWeight: "bold" }}>{chatName}</div>
              <div style={{ fontSize: "0.9em", color: "#555" }}>{lastMessage}</div>
              <button onClick={(e) => handleDeleteChat(chat._id, e)}>
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

function ChatConversation({ chatId, socket }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = localStorage.getItem("userId");

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
        const backendURL = process.env.REACT_APP_BACKEND_URL || "";
        const response = await axios.get(`${backendURL}/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChat(response.data.chat);
        setMessages(response.data.chat?.messages || []);
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
  }, [socket, chatId]);

  const getPartnerName = (participants) => {
    if (!Array.isArray(participants)) return "Chat";
    const partner = participants.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== userId;
    });
    return partner?.fullname || "Chat";
  };

  const getSenderId = (message) => {
    if (!message.sender) return null;
    return typeof message.sender === "object" 
      ? message.sender._id?.toString()
      : message.sender.toString();
  };

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit("chat:message", { chatId, content: input, senderId: userId });
      setInput("");
    }
  };

  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
      <h2>{chat ? getPartnerName(chat.participants) : "Chat"}</h2>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, index) => {
          const senderId = getSenderId(msg);
          const isMyMessage = senderId === userId.toString();

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                margin: "8px 0",
              }}
            >
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "15px",
                  background: isMyMessage ? "#DCF8C6" : "#FFFFFF",
                  maxWidth: "70%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ddd",
          }}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function ChatPage({ socket }) {
  const location = useLocation();
  const [selectedChatId, setSelectedChatId] = useState(
    location.state?.chatId || null
  );

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#D5E5D5",
    }}>
      <div style={{
        width: "30%",
        borderRight: "1px solid #ccc",
        overflowY: "auto",
        backgroundColor: "#EEF1DA",
      }}>
        <header style={{ padding: "10px" }}>
          <Link to="/">
            <img src="/logo.png" alt="Logo" style={{ width: "150px", height: "100px" }} />
          </Link>
        </header>
        <ChatList
          socket={socket}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      
      <div style={{ width: "70%", overflowY: "auto" }}>
        {selectedChatId ? (
          <ChatConversation chatId={selectedChatId} socket={socket} />
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