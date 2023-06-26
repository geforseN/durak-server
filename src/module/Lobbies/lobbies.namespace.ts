import { FastifyInstance, FastifyRequest } from "fastify";
import { SocketStream } from "@fastify/websocket";
import { randomUUID } from "crypto";
import WebSocket from "ws";
import {
  addUserSocketInRoom,
  dispatchMessageToCertainListener,
  emitEverySocketOn,
  emitSocketOn,
  emitSocketOnce,
} from "../../ws";
import Lobbies from "./entity/Lobbies";
import { GameSettings } from "./entity/CorrectGameSettings";
import Lobby from "./entity/Lobby";
import prisma from "../../../prisma";
import EventEmitter from "events";
import { durakGames } from "../../index";
import DurakGame from "../DurakGame/DurakGame.implimetntation";
import User from "./entity/LobbyUser";

export default async function gameLobbiesNamespace(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (connection: SocketStream, request: FastifyRequest) {
      const { userId, socket, lobbies } = handleConnection(connection, request);
      socket.emit("socketOnce", "lobbies::restore", {
        lobbies: lobbies.value,
        lobbyId: await lobbies
          .find(Lobby.hasUserWithSameId.bind({ userId }))
          .then(
            (lobby) => lobby.id,
            () => undefined,
          ),
      });
      socket
        .on(
          "lobby::add",
          async function ({ settings }: { settings: GameSettings }) {
            return lobbies.push(new Lobby({ settings }), this);
          },
        )
        .on(
          "lobby::remove",
          async function ({ lobbyId }: { lobbyId?: string }) {
            lobbyId ??= (
              await lobbies.find(Lobby.hasUserWithSameId.bind({ userId }))
            ).id;
            return lobbies.remove(Lobby.hasSameId.bind({ id: lobbyId }), this);
          },
        )
        .on(
          "lobby::user::join",
          async function ({
            lobbyId,
            slotIndex = -1,
          }: {
            lobbyId: Lobby["id"];
            slotIndex: number;
          }) {
            if (!lobbies.hasUser(User.hasSameId.bind({ id: userId }))) {
              const [lobby, user] = await Promise.all([
                lobbies.find(Lobby.hasSameId.bind({ id: lobbyId })),
                getFirstTimeUser(userId),
              ]);
              return lobby.put(user, slotIndex, this);
            }
            const [oldLobby, newLobby] = await Promise.all([
              lobbies.find(Lobby.hasUserWithSameId.bind({ userId })),
              lobbies.find(Lobby.hasSameId.bind({ id: lobbyId })),
            ]);
            if (newLobby === oldLobby) {
              return oldLobby.swapUser(
                User.hasSameId.bind({ id: userId }),
                slotIndex,
                this,
              );
            }
            return newLobby.put(
              oldLobby.remove(User.hasSameId.bind({ id: userId }), this),
              slotIndex,
              this,
            );
          },
        )
        .on(
          "lobby::user::leave",
          async function ({ lobbyId }: { lobbyId?: Lobby["id"] }) {
            const lobby = await getLobby.call({ lobbies, userId }, lobbyId);
            return lobby.remove(User.hasSameId.bind({ id: userId }), this);
          },
        )
        .on(
          "game::start",
          async function ({ lobbyId }: { lobbyId?: Lobby["id"] }) {
            const lobby = await getLobby.call({ lobbies, userId }, lobbyId);
            durakGames.set(lobby.id, new DurakGame(lobby));
          },
        );
    },
  );
}

function initializeGameLobbies() {
  type UserId = string | ReturnType<typeof randomUUID>;
  const userSockets = new Map<UserId, Set<WebSocket>>();
  const sockets = <WebSocket[]>[];
  const ee = new EventEmitter();
  ee.on("message", (...args) => {
    console.log(...args);
  });
  const lobbies = new Lobbies(ee);
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

async function getLobby(
  this: { lobbies: Lobbies; userId: string },
  lobbyId?: Lobby["id"],
) {
  lobbyId ||= (
    await this.lobbies.find(
      Lobby.hasUserWithSameId.bind({ userId: this.userId }),
    )
  ).id;
  return await this.lobbies.find(Lobby.hasSameId.bind({ id: lobbyId }));
}

export type LobbyUser = Awaited<ReturnType<typeof getFirstTimeUser>>;