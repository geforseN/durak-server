import { randomUUID } from "node:crypto";
import { gameLobbies } from "../../../index";
import checkSocketAuth from "../../../checkers/check-socket-auth";
import tryAppendSocketData from "../../../checkers/try-append-socket-data";
import tryGetCookie from "../../../checkers/try-get-cookie";
import { gameLobbiesCashe } from "../game-lobbies.handler";
import generateNotificationFromError from "../../../utils/generate-notification-from-error";
import { Lobby, LobbySettings } from "../game-lobbies.types";
import { User } from "../../../db/user";
import DB from "../../../db";
import { Socket } from "socket.io";

export default function initiateLobbyCreation(this: {socket: Socket}, gameLobbySettings: LobbySettings) {
  try {
    const cookie = tryGetCookie(this.socket);
    tryAppendSocketData(cookie, this.socket);
    checkSocketAuth(this.socket);

    const settings = validateGameLobbySettings(gameLobbySettings);
    const lobby = makeNewLobby(settings);

    const user = DB.User.findByAccNameOrThrow(this.socket);
    removePrivateUserData(user);

    console.log(this.socket.data.accName);

    leaveOtherRoomsExceptSocket(this.socket);
    this.socket.join(lobby.id);

    gameLobbies.emit("lobbyCreated", lobby);
    
    // maxUsers: undefined
    lobby.users.push(user);
    // gameLobbies.to(lobby.id).emit("addedPlayer", user);
    gameLobbies.emit("addedUser", user, lobby.id);
    gameLobbiesCashe.push(lobby);
    gameLobbiesCashe.forEach(gameLobby => console.log(Object.entries(gameLobby)))
  } catch (error) {
    if (error instanceof Error) {
      const notification = generateNotificationFromError(error);
      gameLobbies.to(this.socket.id).emit("sendNotification", notification);
    } else {
      console.log("GlobalChat Error:", error);
    }
  }
}

function validateGameLobbySettings({
  gameType,
  maxUsers,
}: LobbySettings): LobbySettings | never {
  if (maxUsers < 2)
    throw new Error("Нельзя создать лобби с менее чем 2 игрока");
  if (maxUsers > 6)
    throw new Error("Нельзя создать лобби с более чем 6 игрока");

  const isGameTypeCorrect = ["basic", "perevodnoy"].includes(gameType);
  if (!isGameTypeCorrect) throw new Error("Получен неверный тип игры");

  return { gameType, maxUsers };
}

/**
 * user can have only 2 rooms in gameLobbies namespace
 * first is ${`this.socket.id`} room,
 * second is lobby which user have chosen
 * */
function leaveOtherRoomsExceptSocket(socket: Socket) {
  if (socket.rooms.size > 2) console.log("Strange rooms enjoyer found");

  socket.rooms.forEach((room) => {
    if (room !== socket.id) socket.leave(room);
  });
}


function makeNewLobby(settings: LobbySettings): Lobby {
  return {
    id: randomUUID(),
    settings,
    users: new Array(),
  };
}

function removePrivateUserData(user: User): void {
  delete user.isInvisible;
  delete user.id;
}
