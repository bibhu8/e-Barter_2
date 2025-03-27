// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import io from 'socket.io-client';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PostItem from './pages/PostItem';
import MyItems from './pages/MyItems';
import OfferSwap from './pages/OfferSwap';
import SocketClient from './components/SocketClient';
import './styles/global.css';
import ChatList from './pages/ChatList';
import ChatPage from './pages/ChatPage';
import AuthHandler from './components/AuthHandler';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the socket server running at ${process.env.REACT_APP_BACKEND_URL}
    const socketConnection = io(`${process.env.REACT_APP_BACKEND_URL}`);
    setSocket(socketConnection);

    // Cleanup: Disconnect when the component is unmounted
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home socket={socket}/>}
        />
        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<SignUp />}
        />
        <Route
          path="/post-item"
          element={<PostItem />}
        />
        <Route
          path="/my-items"
          element={<MyItems />}
        />
        <Route
          path="/offer-swap/:itemId"
          element={<OfferSwap />}
        />
        
        <Route path="/chat" element={<ChatPage socket={socket} />} />

        <Route path="/auth-handler" element={<AuthHandler />} />

      </Routes>

      {/* {socket && <SocketClient socket={socket} />} */}
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
