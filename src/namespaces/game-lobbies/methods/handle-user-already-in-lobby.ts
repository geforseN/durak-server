import { lobbies } from "../game-lobbies.handler";
import { gameLobbies } from "../../../index";
import findUserAndLobbyIndexes from "../helpers/find-user-and-lobby-indexes";

export default function handleUserAlreadyInLobby(accName: string): undefined {
  const { userIndex, lobbyIndex } = findUserAndLobbyIndexes(accName);

  const isUserInLobby = lobbyIndex !== -1;
  if (!isUserInLobby) {
    // console.log("user not in lobby, let user join in next function");
    return;
  }

  // console.log("remove player from lobby");
  const lobby = lobbies[lobbyIndex];
  gameLobbies.emit("removePlayer", accName, lobby.id);
  lobby.users.splice(userIndex, 1);

  const isLastUserInLobby = lobby.users.length === 0;
  if (isLastUserInLobby) {
    // console.log("delete lobby if user was alone in lobby");
    gameLobbies.emit("deleteLobby", lobby.id);
    lobbies.splice(lobbyIndex, 1);
  } else {
    // console.log("make other user admin if left user was not alone in lobby);
    lobby.adminAccName = lobby.users[0].accName;
    gameLobbies.emit("updateLobbyAdmin", lobby.adminAccName, lobby.id);
    // console.log("NEW admin", lobby.adminAccName);
  }
}


