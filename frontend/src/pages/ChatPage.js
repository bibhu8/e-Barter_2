// ChatPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";


function ChatPage({ socket }) {
  const { chatId } = useParams(); // using the request ID as chat room identifier
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!socket) return;
  
    // New message listener
  const handleNewMessage = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  // Chat deletion listener
  const handleChatDeleted = () => {
    setChat(null);
    setMessages([]);
  };

    // Fetch the full chat object
    const fetchChat = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedChat = response.data.chat;
        setChat(fetchedChat);
        setMessages(fetchedChat.messages);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    fetchChat();
  
    // Join chat room
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
        content: input, // Use 'content' instead of 'message'
        senderId: userId, // Match server's expected key
      });
      setInput("");
    }
  };

 // Determine the conversation partner's name from populated participants
 let partnerName = "Chat";
 if (chat && chat.participants) {
   const partner = chat.participants.find((p) => {
     const pId = typeof p === "object" ? p._id.toString() : p;
     return pId !== userId;
   });
   // If partner is populated, display fullname; otherwise, leave default
   if (partner && typeof partner === "object" && partner.fullname) {
     partnerName = partner.fullname;
   }
 }

 return (
   <div className="chat-container">
     <div className="chat-header">
       <h2>{partnerName}</h2>
     </div>
     <div className="chat-messages">
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
           >
             <div>{msg.content}</div>
           </div>
         );
       })}
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