import { Server, Socket } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import dotenv from "dotenv";
import serverOptions from "./server-options";

import { IO } from "./index.types";

import { GlobalChatIO } from "./namespaces/global-chat/global-chat.types";
import { GameLobbiesIO } from "./namespaces/game-lobbies/game-lobbies.types";

import globalChatHandler from "./namespaces/global-chat/global-chat.handler";
import gameLobbiesHandler from "./namespaces/game-lobbies/game-lobbies.handler";

dotenv.config();

const port = Number(process.env.PORT);

const io: IO.ServerIO = new Server(port, serverOptions);

instrument(io, { auth: false, mode: "development" });

io.on("connect", (socket: Socket) => {
  console.log(`Hi ${socket.id}`);
  socket.on("disconnect", () => console.log(`Bye ${socket.id}`));
});

export const globalChat: GlobalChatIO.NamespaceIO = io.of("/global-chat");

globalChat.on("connect", globalChatHandler);

export const gameLobbies: GameLobbiesIO.NamespaceIO = io.of("/game-lobbies");

gameLobbies.on("connect", gameLobbiesHandler);
