import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
const port = Number(process.env.PORT);
const io = new Server(port, { cors: {origin: ["http://localhost:5173", "http://127.0.0.1:5173/"]} });

io.on("connection", (socket) => {
  socket.emit("server", "working server");
  socket.on("vue", (message) => console.log(message));
});

