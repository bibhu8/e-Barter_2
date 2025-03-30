import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function ChatList({ socket, onSelectChat, selectedChatId }) {
  const [chats, setChats] = useState([]);
  const currentUserId = localStorage.getItem("userId")?.toString() || "";

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
      const pId = typeof p === "object" ? p._id?.toString() : p?.toString();
      return pId !== currentUserId;
    });
    return partner?.fullname || "Chat Room";
  };

  return (
    <div style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {chats?.length > 0 ? (
        chats.map((chat) => {
          const lastMessage = chat.messages?.slice(-1)[0]?.content || "No messages yet.";
          return (
            <div
              key={chat._id}
              style={{
                background: chat._id === selectedChatId ? "#eee" : "transparent",
                cursor: "pointer",
                padding: "10px",
                borderBottom: "1px solid #ccc",
              }}
              onClick={() => onSelectChat(chat._id)}
            >
              <div style={{ fontWeight: "bold" }}>
                {getPartnerName(chat.participants)}
              </div>
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
  const userId = localStorage.getItem("userId")?.toString() || "";

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
    const partner = participants?.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p?.toString();
      return pId !== userId;
    });
    return partner?.fullname || "Chat";
  };

  const getSenderId = (message) => {
    const sender = message.sender;
    if (!sender) return null;
    return typeof sender === "object" 
      ? sender._id?.toString()
      : sender.toString();
  };

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit("chat:message", { 
        chatId, 
        content: input, 
        senderId: userId 
      });
      setInput("");
    }
  };

  return (
    <div style={{ 
      padding: "10px", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <h2>{chat ? getPartnerName(chat.participants) : "Chat"}</h2>
      
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        {messages.map((msg, index) => {
          const senderId = getSenderId(msg);
          const isMyMessage = senderId === userId;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isMyMessage ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "15px",
                  background: isMyMessage ? "#DCF8C6" : "#FFFFFF",
                  maxWidth: "75%",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  wordBreak: "break-word",
                  fontSize: "15px",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginTop: "15px",
        padding: "10px 0",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px 20px",
            borderRadius: "25px",
            border: "1px solid #ddd",
            fontSize: "15px",
          }}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "12px 25px",
            borderRadius: "25px",
            border: "none",
            background: "#4CAF50",
            color: "white",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "500",
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
      backgroundColor: "#f5f5f5",
    }}>
      <div style={{
        width: "30%",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        backgroundColor: "#ffffff",
      }}>
        <header style={{ 
          padding: "20px",
          borderBottom: "1px solid #eee",
        }}>
          <Link to="/">
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ 
                width: "180px", 
                height: "auto",
                maxHeight: "100px",
                objectFit: "contain"
              }} 
            />
          </Link>
        </header>
        <ChatList
          socket={socket}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      
      <div style={{ 
        width: "70%", 
        overflowY: "auto",
        backgroundColor: "#fafafa",
      }}>
        {selectedChatId ? (
          <ChatConversation chatId={selectedChatId} socket={socket} />
        ) : (
          <div style={{ 
            padding: "40px 20px",
            textAlign: "center",
            color: "#666",
          }}>
            <h3>Select a chat to start messaging</h3>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;