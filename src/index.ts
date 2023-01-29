import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import { type ExtendedError } from "socket.io/dist/namespace";
import cors from "cors";
import dotenv from "dotenv";
import serverOptions from "./server.options";
import { IO } from "./index.types";
import { GlobalChatIO } from "./namespaces/global-chat/global-chat.types";
import { LobbiesIO } from "./namespaces/lobbies/lobbies.types";
import profile from "./api/profle";
import globalChatHandler from "./namespaces/global-chat/global-chat.handler";
import gameLobbiesHandler from "./namespaces/lobbies/lobbies.handler";
import ioHandler from "./namespaces/io/io.handler";
import DurakGame from "./durak-game/durak-game";
import Lobbies from "./namespaces/lobbies/entity/lobbies";
import LobbiesService from "./namespaces/lobbies/lobbies.service";
import onConnectMiddleware from "./namespaces/lobbies/helpers/on-connect.middleware";
import { GamesIO } from "./namespaces/games/games.types";
import assertGuestSocket from "./namespaces/lobbies/helpers/assert-guest-socket";

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
lobbiesNamespace.on("connect", gameLobbiesHandler);

const uuidGameIdRegExp = /^\/game\/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

type GameId = string;
export const durakGames = new Map<GameId, DurakGame>();

export const gamesNamespace: GamesIO.NamespaceIO = io.of(uuidGameIdRegExp);

gamesNamespace.use(onConnectMiddleware);
gamesNamespace.on("connect", (socket: GamesIO.SocketIO) => {
  try {
    assertGuestSocket(socket);
  } catch (e) {
    socket.disconnect();
  }

  const accname = socket.data.accname!;
  const gameId = socket.nsp.name;
  if (!durakGames.has(gameId)) return socket.disconnect();

  const game = durakGames.get(gameId)!;
  socket.once("playersIndexes", () => {
    // надо прочекать, что эвент послали один раз
    gamesNamespace.to(accname).emit("playersIndexes", game.players.playersIndexes);
  });

  const player = game.players.getPlayerByAccname({ accname });
  if (!player) return socket.disconnect();

  socket.once("firstDistribution", () => {
    if (!player.info.isConnected) {
      player.info.isConnected = true;
      game.handleFirstDistribution(player);

      const cards = game.players.getPlayerHandByAccname({ accname });
      if (!cards) return console.log(`no cards for ${accname}`);

      gamesNamespace.to(accname).emit("firstDistribution:me", cards.value);
      gamesNamespace.except(accname).emit("firstDistribution", accname, cards.count);
    }
  });

  console.log("МОЯ ИГРА", gameId, ":", durakGames.get(gameId)!.talon.count);
});

httpServer.listen(port);
instrument(io, { auth: false, mode: "development" });
