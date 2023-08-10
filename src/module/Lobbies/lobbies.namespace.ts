import type { FastifyInstance, FastifyRequest } from "fastify";
import type { SocketStream } from "@fastify/websocket";
import type { GameSettings } from "./entity/CorrectGameSettings";
import type Lobby from "./entity/Lobby";
import { SocketsStore, defaultListeners } from "../../ws";
import Lobbies from "./entity/Lobbies";
import prisma from "../../../prisma";
import EventEmitter from "events";

type GameLobbiesContext = ReturnType<ReturnType<typeof initializeGameLobbies>>;

export default async function gameLobbiesPlugin(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (connection: SocketStream, request: FastifyRequest) {
      // TODO add userProfile in return object of handleConnection
      const context = handleConnection(connection, request);
      context.socket.emit("lobbies::restore", context.lobbies.state);
      if (!context.user.id) {
        return console.log("FAST RETURN: NO USER_ID");
      }
      context.socket
        .on("lobby::add", ({ settings }: { settings: GameSettings }) =>
          context.lobbies.pushNewLobby(settings, context.user),
        )
        .on("lobby::remove", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.removeLobby(lobbyId, context.user),
        )
        .on(
          "lobby::user::join",
          // TODO in lobbies.addUserInLobby instead of userId use userProfile as first param
          async ({
            lobbyId,
            slotIndex = -1,
          }: {
            lobbyId: Lobby["id"];
            slotIndex: number;
          }) =>
            await context.lobbies.addUserInLobby(
              lobbyId,
              context.user,
              slotIndex,
            ),
        )
        .on("lobby::user::leave", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.removeUserFromLobby(lobbyId, context.user),
        )
        .on("lobby::upgrade", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.upgradeLobbyToNonStartedGame(lobbyId, context.user),
        )
        .on(
          "lobby::user::move",
          ({
            slotIndex,
            lobbyId,
          }: {
            slotIndex: number;
            lobbyId?: Lobby["id"];
          }) => {
            // CHECK slotIndex !== IS valid AND slotIndex !== -1
          },
        );
    },
  );
}

function initializeGameLobbies() {
  const socketsStore = new SocketsStore();
  const lobbies = new Lobbies(
    new EventEmitter().addListener("everySocket", socketsStore.emitSockets),
  );
  return function handleConnection(
    connection: SocketStream,
    request: FastifyRequest,
  ) {
    socketsStore.add(connection.socket);
    socketsStore
      .room(request.session.userProfile.userId)
      .add(connection.socket);
    connection.socket
      .addListener("message", defaultListeners.message)
      .addListener("socket", defaultListeners.socket)
      .addListener("everySocket", socketsStore.emitSockets);
    return {
      user: {
        ...request.session.userProfile,
        id: request.session.userProfile.userId,
        userProfile: request.session.userProfile,
        isAdmin: false,
      },
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

// TODO remove me
export type LobbyUser = Awaited<ReturnType<typeof getFirstTimeUser>>;
