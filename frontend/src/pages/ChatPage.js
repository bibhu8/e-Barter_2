// ChatPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

// ChatList component – originally in ChatList.jsx
// Modified to remove routing and use a callback (onSelectChat)
// to notify the parent when a chat is selected.
function ChatList({ socket, onSelectChat, selectedChatId }) {
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
        const filtered = prevChats.filter(
          (chat) => chat._id !== updatedChat._id
        );
        return [updatedChat, ...filtered];
      });
    };

    // Listen for deletion events to remove chats from the list
    const handleChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
      // If the currently selected chat was deleted, clear it.
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
    // Prevent the onClick for selecting the chat from firing
    event.stopPropagation();
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
    <div className="chatlist-container" style={{ padding: "10px" }}>
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => {
          // Determine chat partner name
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

          // Extract the last message content if available
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].content
              : "No messages yet.";

          // Highlight if selected
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

// ChatConversation component – based on ChatPage.jsx
// Modified to accept a chatId prop instead of using useParams.
function ChatConversation({ chatId, socket }) {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!socket || !chatId) return;

    // Listener for new messages
    const handleNewMessage = (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    // Listener for chat deletion
    const handleChatDeleted = () => {
      setChat(null);
      setMessages([]);
    };

    // Fetch the full chat object with messages
    const fetchChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedChat = response.data.chat;
        setChat(fetchedChat);
        setMessages(fetchedChat.messages);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();

    // Join chat room and setup socket listeners
    socket.emit("join-chat", chatId);
    socket.on("chat:message", handleNewMessage);
    socket.on("chat:deleted", handleChatDeleted);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:deleted", handleChatDeleted);
      socket.emit("leave-chat", chatId);
    };
  }, [socket, chatId]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chat:message", {
        chatId,
        content: input,
        senderId: userId,
      });
      setInput("");
    }
  };

  // Determine conversation partner name
  let partnerName = "Chat";
  if (chat && chat.participants) {
    const partner = chat.participants.find((p) => {
      const pId = typeof p === "object" ? p._id.toString() : p;
      return pId !== userId;
    });
    if (partner && typeof partner === "object" && partner.fullname) {
      partnerName = partner.fullname;
    }
  }

  return (
    <div className="chat-container" style={{ padding: "10px" }}>
      <div className="chat-header">
        <h2>{partnerName}</h2>
      </div>
      <div className="chat-messages" style={{ height: "60vh", overflowY: "auto" }}>
        {messages.map((msg, index) => {
          const senderId =
            msg.sender && typeof msg.sender === "object"
              ? msg.sender._id.toString()
              : msg.sender;
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
              <div>{msg.content}</div>
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

// Main ChatPage component that renders the chat list and conversation side by side.
function ChatPage({ socket }) {
  const location = useLocation();
  // Use the chatId from the navigation state if it exists; otherwise, default to null
  const initialChatId = location.state?.chatId || null;
  const [selectedChatId, setSelectedChatId] = useState(initialChatId);

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
                    <img
                      src="/logo.png"
                      alt="Logo"
                      style={{ width: "150px", height: "100px" }}
                    />
                  </Link>
                </div>
              </header>
        <ChatList
          socket={socket}
          onSelectChat={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>
      <div className="chat-conversation-column" style={{ width: "70%", overflowY: "auto"}}>
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
