import { Server } from "socket.io";
import dotenv from "dotenv";
import { instrument } from "@socket.io/admin-ui";
import { Socket } from "socket.io";
import globalChatHandler from "./namespaces/global-chat";
dotenv.config();

const port = Number(process.env.PORT);

const io = new Server(port, {
  cookie: true,
  cors: {
    origin: [
      "https://admin.socket.io",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  },
});

instrument(io, { auth: false, mode: "development" });

io.on("connection", (socket: Socket) => {
  console.log(`Hi ${socket.id}`);
  socket.on("disconnect", () => console.log(`Bye ${socket.id}`));
});

export const globalChat = io.of("/global-chat");

globalChat.on("connect", globalChatHandler);

