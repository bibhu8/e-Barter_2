import React from "react";
import { Link } from "react-router-dom";

function RequestNotification({ swapRequests, currentUser }) {
  // Count only pending requests for the current user (for example, those received)
  const pendingRequests = swapRequests.filter(
    (req) =>
      req.status === "pending" &&
      req.receiver &&
      currentUser &&
      req.receiver._id === currentUser._id
  );
  const pendingCount = pendingRequests.length;

  return (
    <Link to="#" className="btn request-notification-btn" onClick={(e) => e.preventDefault()}>
     
      {pendingCount > 0 && (
        <span className="notification-badge" style={styles.badge}>
          {pendingCount}
        </span>
      )}
    </Link>
  );
}

const styles = {
  badge: {
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    padding: "0.25rem 0.5rem",
    fontSize: "0.75rem",
    marginLeft: "0.5rem",
  },
};

export default RequestNotification;
