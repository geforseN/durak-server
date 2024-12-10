import assert from "node:assert";
import type { WebSocket } from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { InitialGameSettings } from "@durak-game/durak-dts";
import {
  CustomWebsocketEvent,
  NotificationAlertEvent,
  SocketsStore,
  defaultListeners,
} from "../../../ws/index.js";

import Lobbies from "../../../module/Lobbies/entity/Lobbies.js";
import type Lobby from "../../../module/Lobbies/entity/Lobby.js";

export default async function gameLobbiesPlugin(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (socket: WebSocket, request: FastifyRequest) {
      const context = handleConnection(socket, request);
      if (!context.user?.id) {
        socket.send(
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
      socket.send(new GameLobbiesStateRestoreEvent(context.lobbies).asString);
      try {
        socket.on(
          "lobby::add",
          ({ settings }: { settings: InitialGameSettings }) => {
            context.lobbies.pushNewLobby({
              initiator: context.user,
              settings,
            });
          },
        );
        socket.on("lobby::remove", ({ lobbyId }: { lobbyId?: Lobby["id"] }) => {
          context.lobbies.removeLobby({
            initiator: context.user,
            lobbyId,
          });
        });
        socket.on(
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
        socket.on(
          "lobby::user::leave",
          ({ lobbyId }: { lobbyId?: Lobby["id"] }) => {
            context.lobbies.removeUserFromLobby(context.user, lobbyId);
          },
        );
        socket.on(
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
        socket.emit(new NotificationAlertEvent(error).asString);
      }
    },
  );
}

function initializeGameLobbies() {
  const socketsStore = new SocketsStore();
  const lobbies = new Lobbies(socketsStore);

  return function handleConnection(socket: WebSocket, request: FastifyRequest) {
    socketsStore.add(socket);
    if (request.session.user) {
      socketsStore.room(request.session.user.id).add(socket);
    }
    socket
      .addListener("message", defaultListeners.message)
      .addListener("socket", defaultListeners.socket);
    return {
      user: request.session.user,
      socket,
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
