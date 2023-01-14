import { Server } from "socket.io";
import dotenv from "dotenv";
import { instrument } from "@socket.io/admin-ui";
import { Socket } from "socket.io";
import globalChatHandler from "./namespaces/global-chat";
import serverOptions from "./server-options";
dotenv.config();

const port = Number(process.env.PORT);

const io = new Server(port, serverOptions);

instrument(io, { auth: false, mode: "development" });

io.on("connection", (socket: Socket) => {
  console.log(`Hi ${socket.id}`);
  socket.on("disconnect", () => console.log(`Bye ${socket.id}`));
});

export const globalChat = io.of("/global-chat");

globalChat.on("connect", globalChatHandler);

