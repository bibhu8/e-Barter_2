// src/components/SocketClient.js

import React, { useEffect, useState } from 'react';

const SocketClient = ({ socket }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (socket) {
      // Listen for any incoming message from the server
      socket.on('message', (data) => {
        console.log('Received message from server: ', data);
        setMessage(data);
      });
      
      // Cleanup: Disconnect when the component is unmounted
      return () => {
        socket.off('message');
      };
    }
  }, [socket]);

  const sendMessage = () => {
    if (socket) {
      socket.emit('sendMessage', 'Hello from React!');
    }
  };

  return (
    <div>
      <h1>Socket.io React Client</h1>
      <p>Received Message: {message}</p>
      <button onClick={sendMessage}>Send Message to Server</button>
    </div>
  );
};

export default SocketClient;
