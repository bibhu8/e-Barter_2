import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function ChatNotification({ socket }) {
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (!socket) {
      console.warn("Socket is not defined");
      return;
    }

    const handleNewMessage = (newMessage) => {
      console.log("Received chat message:", newMessage);

      if (location.pathname !== "/chat") {
        setNotificationCount((prev) => prev + 1);
      } else {
        console.log("User is already on chat page, no notification needed.");
      }
    };

    // Log socket connection for debug
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
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
        onClick={() => socket?.emit("chat:message", { from: "system", text: "Test Message" })}
        style={{ marginLeft: 10 }}
      >
        Chat
      </button>
    </div>
  );
}

export default ChatNotification;
