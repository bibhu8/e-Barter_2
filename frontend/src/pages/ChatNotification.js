import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function ChatNotification({ socket, user }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  // Join the personal room using the user's ID
  useEffect(() => {
    if (socket && user?._id) {
      console.log("[chat-notif] Joining personal room:", user._id);
      socket.emit("join", user._id.toString());
    }
  }, [socket, user]);

  // Listen for chat update events (for notifications)
  useEffect(() => {
    if (!socket) {
      console.warn("Socket is not defined");
      return;
    }
    console.log("Socket is available:", socket);

    const handleChatUpdate = (chatData) => {
      console.log("[chat-notif] Received chat update:", chatData);
      // If the current URL doesn't start with "/chat", then increment notifications.
      // (You might want to adjust this if your chat URLs are more complex.)
      if (!location.pathname.startsWith("/chat")) {
        setNotificationCount((prev) => {
          console.log("[chat-notif] Incrementing badge from", prev);
          return prev + 1;
        });
      } else {
        console.log("[chat-notif] On chat page, no badge update");
      }
    };

    socket.on("chat:update", handleChatUpdate);

    return () => {
      socket.off("chat:update", handleChatUpdate);
    };
  }, [socket, location.pathname]);

  // When the user clicks the notification, reset the badge
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

      {/* Debug button for testing; remove it in production */}
      <button
        onClick={() =>
          socket?.emit("chat:update", {
            // For testing, emit an update to the user's personal room.
            // In production, your backend would emit this event automatically.
            _id: "test-chat-id",
            lastMessage: "Test Chat Update",
          })
        }
        style={{ marginLeft: 10 }}
      >
        Test Notification
      </button>
    </div>
  );
}

export default ChatNotification;
