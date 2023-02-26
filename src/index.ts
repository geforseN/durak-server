import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { type ExtendedError } from "socket.io/dist/namespace";
import cors from "cors";
import dotenv from "dotenv";
import serverOptions from "./server.options";
import { IO } from "./namespaces/io/io.types";
import { GlobalChatIO } from "./namespaces/global-chat/global-chat.types";
import { LobbiesIO } from "./namespaces/lobbies/lobbies.types";
import profile from "./api/profle";
import ioHandler from "./namespaces/io/io.handler";
import globalChatHandler from "./namespaces/global-chat/global-chat.handler";
import lobbiesHandler from "./namespaces/lobbies/lobbies.handler";
import gamesHandler from "./namespaces/games/games.handler";
import DurakGame from "./durak-game/durak-game";
import Lobbies from "./namespaces/lobbies/entity/lobbies";
import LobbiesService from "./namespaces/lobbies/lobbies.service";
import onConnectMiddleware from "./namespaces/lobbies/helpers/on-connect.middleware";
import { GamesIO } from "./namespaces/games/games.types";

export type NextSocketIO = (err?: (ExtendedError | undefined)) => void

dotenv.config();
const app = express();
const httpServer = createServer(app);
const port = Number(process.env.PORT);

app.use(cors({ origin: serverOptions.cors.origin }));

app.use("/api/profile", profile);

export const io: IO.ServerIO = new Server(httpServer, serverOptions);
io.on("connect", ioHandler);

export const globalChat: GlobalChatIO.NamespaceIO = io.of("/global-chat");
globalChat.on("connect", globalChatHandler);

export const lobbiesNamespace: LobbiesIO.NamespaceIO = io.of("/lobbies");

export const lobbies = new Lobbies();
export const lobbiesService = new LobbiesService(lobbies, lobbiesNamespace);

lobbiesNamespace.use(onConnectMiddleware);
lobbiesNamespace.on("connect", lobbiesHandler);

const uuidRegExp = /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
export const durakGames = new Map<string, DurakGame>();

export const gamesNamespace: GamesIO.NamespaceIO = io.of(uuidRegExp);
gamesNamespace.use(onConnectMiddleware);
gamesNamespace.on("connect", gamesHandler.bind({namespace: gamesNamespace}));

httpServer.listen(port);
instrument(io, { auth: false, mode: "development" });
