// ChatPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ChatPage({ socket }) {
  const { chatId } = useParams(); // using the request ID as chat room identifier
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket) return;
  
    // Join chat room
    socket.emit("join-chat", chatId);
  
    // Message listener
    const handleMessage = (message) => {
      if (message.chatId === chatId) {
        setMessages(prev => [...prev, message]);
      }
    };
  
    socket.on("chat:message", handleMessage);
  
    return () => {
      socket.off("chat:message", handleMessage);
      socket.emit("leave-chat", chatId);
    };
  }, [socket, chatId]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("chat:message", {
        chatId,
        message: input,
        sender: localStorage.getItem("userId"),
      });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <p>Chat ID: {chatId}</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatPage;
