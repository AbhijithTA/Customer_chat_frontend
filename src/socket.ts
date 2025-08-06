import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket", "polling"], 
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

export default socket;
