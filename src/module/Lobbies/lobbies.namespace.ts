import type WebSocket from "ws";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { SocketStream } from "@fastify/websocket";
import type { randomUUID } from "crypto";
import type { GameSettings } from "./entity/CorrectGameSettings";
import type Lobby from "./entity/Lobby";
import {
  addUserSocketInRoom,
  dispatchMessageToCertainListener,
  emitEverySocketOn,
  emitSocketOn,
  emitSocketOnce,
} from "../../ws";
import Lobbies from "./entity/Lobbies";
import prisma from "../../../prisma";
import EventEmitter from "events";

export default async function gameLobbiesNamespace(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (connection: SocketStream, request: FastifyRequest) {
      const { userId, socket, lobbies } = handleConnection(connection, request);
      // NOTE: emit this ONCE
      socket.emit("lobbies::restore", await lobbies.restoreState(userId));
      if (!userId) {
        return console.log("FAST RETURN: NO USER_ID");
      }
      socket
        .on("lobby::add", ({ settings }: { settings: GameSettings }) =>
          lobbies.pushNewLobby(settings),
        )
        .on("lobby::remove", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          lobbies.removeLobby(userId, lobbyId),
        )
        .on(
          "lobby::user::join",
          // ? should this handler be async ?
          async ({
            lobbyId,
            slotIndex = -1,
          }: {
            lobbyId: Lobby["id"];
            slotIndex: number;
          }) => await lobbies.addUserInLobby(userId, lobbyId, slotIndex),
        )
        .on(
          "lobby::user::leave",
          // ? should this handler be async ?
          async ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
            await lobbies.removeUserFromLobby(userId, lobbyId),
        )
        .on(
          "lobby::upgrate",
          // ? should this handler be async ?
          async ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
            await lobbies.updateLobbyToUnstartedGame(userId, lobbyId),
        )
        .on("lobby::user::move", () => {});
    },
  );
}

function initializeGameLobbies() {
  type UserId = string | ReturnType<typeof randomUUID>;
  const userSockets = new Map<UserId, Set<WebSocket>>();
  const sockets = <WebSocket[]>[];
  const lobbies = new Lobbies(
    new EventEmitter().on(
      "everySocket",
      (eventName: string, payload: Record<string, any>) => {
        const message = JSON.stringify({ eventName, payload });
        sockets.forEach((socket) => socket.emit(message));
      },
    ),
  );
  return function handleConnection(
    connection: SocketStream,
    request: FastifyRequest,
  ) {
    sockets.push(connection.socket);
    addUserSocketInRoom.call(
      { userSockets },
      connection.socket,
      request.session.userProfile.userId,
    );
    dispatchMessageToCertainListener(connection.socket);
    emitSocketOn(connection.socket);
    emitSocketOnce(connection.socket);
    emitEverySocketOn(connection.socket, sockets);
    return {
      userId: request.session.userProfile.userId,
      socket: connection.socket,
      lobbies,
    };
  };
}

export async function getFirstTimeUser(userId: string) {
  return {
    ...(await prisma.userProfile.findUniqueOrThrow({
      where: { userId },
      select: {
        connectStatus: true,
        nickname: true,
        photoUrl: true,
        personalLink: true,
      },
    })),
    id: userId,
    isAdmin: false,
  };
}

export type LobbyUser = Awaited<ReturnType<typeof getFirstTimeUser>>;
