import { Server as socketIo } from "socket.io";

// Initialize and export the Socket.IO instance
let io;

export const initializeSocket = (server) => {
  io = new socketIo(server, {
    cors: {
      origin: "*",
    },
  });

  return io;
};

export const getIo = () => io;
