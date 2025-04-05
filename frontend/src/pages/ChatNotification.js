import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function ChatNotification({ socket }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  // Listen for new chat messages from the websocket.
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only increase count if the user is not currently in the chat view
      // You can add custom logic here to check the message's chatId versus the currently active chat route.
      if (location.pathname !== "/chat") {
        setNotificationCount((prev) => prev + 1);
      }
    };

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
    };
  }, [socket, location.pathname]);

  // Reset the notifications when the user visits the chat page.
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
    </div>
  );
}

export default ChatNotification;
