import assert from "node:assert";
import type { SocketStream } from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { InitialGameSettings } from "@durak-game/durak-dts";
import {
  CustomWebsocketEvent,
  NotificationAlertEvent,
  SocketsStore,
  defaultListeners,
} from "@/ws/index.js";

import Lobbies from "./entity/Lobbies.js";
import type Lobby from "./entity/Lobby.js";

export default async function gameLobbiesPlugin(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (connection: SocketStream, request: FastifyRequest) {
      const context = handleConnection(connection, request);
      if (!context.user?.id) {
        context.socket.send(
          new NotificationAlertEvent(
            new Error(
              "Не удалось получить данный игровых лобби. \n" +
                "Войдите в свой аккаунт или отчистите файлы cookie для данного сайта",
            ),
          ).asString,
        );
        request.server.log.error({ request }, "No user.id found");
        return;
      }
      context.socket.send(
        new GameLobbiesStateRestoreEvent(context.lobbies).asString,
      );
      try {
        context.socket.on(
          "lobby::add",
          ({ settings }: { settings: InitialGameSettings }) => {
            context.lobbies.pushNewLobby({
              initiator: context.user,
              settings,
            });
          },
        );
        context.socket.on(
          "lobby::remove",
          ({ lobbyId }: { lobbyId?: Lobby["id"] }) => {
            context.lobbies.removeLobby({
              initiator: context.user,
              lobbyId,
            });
          },
        );
        context.socket.on(
          "lobby::user::join",
          async ({
            lobbyId,
            slotIndex = -1,
          }: {
            lobbyId: Lobby["id"];
            slotIndex: number;
          }) => {
            await context.lobbies.addUserInLobby({
              user: context.user,
              lobbyId,
              slotIndex,
            });
          },
        );
        context.socket.on(
          "lobby::user::leave",
          ({ lobbyId }: { lobbyId?: Lobby["id"] }) => {
            context.lobbies.removeUserFromLobby(context.user, lobbyId);
          },
        );
        context.socket.on(
          "lobby::upgrade",
          ({ lobbyId }: { lobbyId?: Lobby["id"] }) => {
            context.lobbies.upgradeLobbyToNonStartedGame({
              initiator: context.user,
              lobbyId,
            });
          },
        );
      } catch (error) {
        assert.ok(error instanceof Error);
        context.socket.emit(new NotificationAlertEvent(error).asString);
      }
    },
  );
}

function initializeGameLobbies() {
  const socketsStore = new SocketsStore();
  const lobbies = new Lobbies(socketsStore);

  return function handleConnection(
    connection: SocketStream,
    request: FastifyRequest,
  ) {
    socketsStore.add(connection.socket);
    socketsStore.room(request.session.user.id).add(connection.socket);
    connection.socket
      .addListener("message", defaultListeners.message)
      .addListener("socket", defaultListeners.socket);
    return {
      user: request.session.user,
      socket: connection.socket,
      lobbies,
    };
  };
}

class GameLobbiesStateRestoreEvent extends CustomWebsocketEvent {
  state;

  constructor(lobbies: Lobbies) {
    super("lobbies::restore");
    this.state = lobbies;
  }
}
