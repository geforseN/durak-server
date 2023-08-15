import type { FastifyInstance, FastifyRequest } from "fastify";
import type { SocketStream } from "@fastify/websocket";
import type { GameSettings } from "./entity/CorrectGameSettings";
import type Lobby from "./entity/Lobby";
import {
  CustomWebsocketEvent,
  NotificationAlertEvent,
  SocketsStore,
  defaultListeners,
} from "../../ws";
import Lobbies from "./entity/Lobbies";

type GameLobbiesContext = ReturnType<ReturnType<typeof initializeGameLobbies>>;

export default async function gameLobbiesPlugin(fastify: FastifyInstance) {
  const handleConnection = initializeGameLobbies();
  fastify.get(
    "/game-lobbies",
    { websocket: true },
    async function (connection: SocketStream, request: FastifyRequest) {
      // TODO add userProfile in return object of handleConnection
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
        return request.server.log.error({ request }, "No user.id found");
      }
      context.socket.send(
        new GameLobbiesStateRestoreEvent(context.lobbies).asString,
      );
      context.socket
        .on("lobby::add", ({ settings }: { settings: GameSettings }) =>
          context.lobbies.pushNewLobby({ initiator: context.user, settings }),
        )
        .on("lobby::remove", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.removeLobby({ initiator: context.user, lobbyId }),
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
            await context.lobbies.addUserInLobby({
              user: context.user,
              lobbyId,
              slotIndex,
            }),
        )
        .on("lobby::user::leave", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.removeUserFromLobby(context.user, lobbyId),
        )
        .on("lobby::upgrade", ({ lobbyId }: { lobbyId?: Lobby["id"] }) =>
          context.lobbies.upgradeLobbyToNonStartedGame({
            initiator: context.user,
            lobbyId,
          }),
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
    // TODO
    // ? can add lobby in session ?
    // ? no need all this below ?
    request.session.user.isLobbyAdmin = false;
    request.session.isUserLobbyAdmin = false;
    request.session.save().then(
      () => {
        request.server.log.info(
          { requestId: request.id },
          "save lobby related data in session",
        );
      },
      (error: unknown) => {
        request.server.log.error(
          { error, requestId: request.id },
          "save lobby related data in session",
        );
      },
    );
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
