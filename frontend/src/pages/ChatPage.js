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
        console.log("Fetched chats:", response.data.chats);
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

  // Extract partner's name from participants (the one that's not the current user)
  const getPartnerName = (participants) => {
    if (!Array.isArray(participants)) return "Chat Room";
    const partner = participants.find((p) => {
      const pId = typeof p === "object" ? p._id?.toString() : p;
      return pId !== currentUserId;
    });
    if (partner && typeof partner === "object" && partner.fullname) {
      return partner.fullname;
    }
    return "Chat Room";
  };

  return (
    <div className="chatlist-container" style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {Array.isArray(chats) && chats.length > 0 ? (
        chats.map((chat) => {
          if (!chat) return null;
          const chatName = getPartnerName(chat.participants);
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : "No messages yet.";
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
              <div className="chat-name" style={{ fontWeight: "bold" }}>
                {chatName}
              </div>
              <div
                className="chat-last-message"
                style={{ fontSize: "0.9em", color: "#555" }}
              >
                {lastMessage}
              </div>
              <button onClick={(event) => handleDeleteChat(chat._id, event)}>
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
        const fetchedChat = response.data.chat;
        setChat(fetchedChat);
        setMessages(fetchedChat.messages || []);
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

  // Extract partner's name from participants
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

  // Helper to safely get sender id
  const getSenderId = (message) => {
    if (!message.sender) return null;
    if (typeof message.sender === "object") {
      return message.sender._id?.toString();
    }
    return message.sender;
  };

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit("chat:message", {
        chatId,
        content: input,
        senderId: userId,
      });
      setInput("");
    }
  };

  return (
    <div className="chat-container" style={{ padding: "10px" }}>
      <div className="chat-header">
        <h2>{partnerName}</h2>
      </div>
      <div className="chat-messages" style={{ height: "60vh", overflowY: "auto" }}>
        {messages.map((msg, index) => {
          const senderId = getSenderId(msg);
          const isMyMessage = senderId === userId;
          return (
            <div
              key={index}
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
        <button onClick={sendMessage} style={{ padding: "5px 10px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

function ChatPage({ socket }) {
  const location = useLocation() || {};
  const initialChatId = location.state && location.state.chatId ? location.state.chatId : null;
  const [selectedChatId, setSelectedChatId] = useState(initialChatId);

  console.log("ChatPage: location", location);
  console.log("ChatPage: selectedChatId", selectedChatId);
  console.log("ChatPage: socket", socket);

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
      <div
        className="chatlist-column"
        style={{
          width: "30%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          backgroundColor: "#EEF1DA",
        }}
      >
        <header className="header">
          <div className="logo">
            <Link to="/">
              <img src="/logo.png" alt="Logo" style={{ width: "150px", height: "100px" }} />
            </Link>
          </div>
        </header>
        <ChatList
          socket={socket}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      <div className="chat-conversation-column" style={{ width: "70%", overflowY: "auto" }}>
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
