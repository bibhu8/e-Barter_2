import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function ChatNotification({ socket, user }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  // Join user's chat rooms
  useEffect(() => {
    if (socket && user?.chats?.length) {
      console.log("[chat-notif] Joining chat rooms:", user.chats);
      user.chats.forEach(chatId => {
        socket.emit("join-chat", chatId);
      });
    }
  }, [socket, user]);

  // Listen for messages
  useEffect(() => {
    if (!socket) {
      console.warn("Socket is not defined");
      return;
    }

    const handleNewMessage = (newMessage) => {
      console.log("[chat-notif] Path:", location.pathname);
      console.log("[chat-notif] Received message:", newMessage);

      if (location.pathname !== "/chat") {
        setNotificationCount((prev) => {
          console.log("[chat-notif] Incrementing badge from", prev);
          return prev + 1;
        });
      } else {
        console.log("[chat-notif] Already on /chat, no badge update");
      }
    };

    socket.on("connect", () => {
      console.log("[chat-notif] Socket connected:", socket.id);
    });

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
      socket.off("connect");
    };
  }, [socket, location.pathname]);

  const handleClick = () => {
    setNotificationCount(0);
  };

  return (
    <div className="chat-notification" style={{ position: "relative", display: "inline-block" }}>
      <Link to="/chat" onClick={handleClick}>
        <i className="fa-solid fa-comments" style={{ fontSize: "24px" }}></i>
        {notificationCount > 0 && (
          <span
            className="notification-badge"
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px",
            }}
          >
            {notificationCount}
          </span>
        )}
      </Link>

      {/* Debug button - remove in production */}
      <button
        onClick={() =>
          socket?.emit("chat:message", {
            chatId: user?.chats?.[0] || "demo-room",
            content: "Test Message",
            senderId: user?._id || "system",
          })
        }
        style={{ marginLeft: 10 }}
      >
        Chat
      </button>
    </div>
  );
}

export default ChatNotification;
