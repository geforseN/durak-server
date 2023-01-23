import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import { instrument } from "@socket.io/admin-ui";
import dotenv from "dotenv";
import serverOptions from "./server.options";

import { IO } from "./index.types";

import { GlobalChatIO } from "./namespaces/global-chat/global-chat.types";
import { GameLobbiesIO } from "./namespaces/game-lobbies/game-lobbies.types";

import globalChatHandler from "./namespaces/global-chat/global-chat.handler";
import gameLobbiesHandler from "./namespaces/game-lobbies/game-lobbies.handler";
import profile from "./api/profile.router";
import cors from "cors";
import ioHandler from "./namespaces/io/io.handler";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT);

app.use(cors({ origin: serverOptions.cors.origin }));

app.use("/api/profile", profile);

app.get("/", (req, res) => {
  res.send({ hello: "world!" });
});

export const io: IO.ServerIO = new Server(httpServer, serverOptions);
io.on("connect", ioHandler);

export const globalChat: GlobalChatIO.NamespaceIO = io.of("/global-chat");
globalChat.on("connect", globalChatHandler);

export const gameLobbies: GameLobbiesIO.NamespaceIO = io.of("/game-lobbies");
gameLobbies.on("connect", gameLobbiesHandler);

httpServer.listen(port);

const uuidGameIdRegExp = /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export const uncompletedGames = io.of(uuidGameIdRegExp);
uncompletedGames.on("connect", () => {
  console.log("ASD")
});

instrument(io, { auth: false, mode: "development" });
