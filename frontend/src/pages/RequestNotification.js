import React from "react";

function RequestNotification({ swapRequests, currentUser }) {
  // Count only pending requests where the logged-in user is the receiver.
  const pendingRequests = swapRequests.filter(
    (req) =>
      req.status === "pending" &&
      req.receiver &&
      currentUser &&
      req.receiver._id === currentUser._id
  );

  const pendingCount = pendingRequests.length;

  // If there are no pending requests, render nothing
  if (pendingCount === 0) {
    return null;
  }

  // Otherwise, show the badge
  return (
    <span className="notification-badge" style={styles.badge}>
      {pendingCount}
    </span>
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
