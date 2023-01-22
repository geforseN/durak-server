import { lobbies } from "../game-lobbies.handler";
import userMatcher from "../../../db/user.matcher";

export default function findUserAndLobbyIndexes(accName: string): { userIndex: number, lobbyIndex: number } {
  let userIndex = -1;
  let lobbyIndex = -1;
  for (let i = 0; i < lobbies.length; i++) {
    const lobby = lobbies[i];
    const userI = lobby.users.findIndex(userMatcher, { accName });
    if (userI !== -1) {
      userIndex = userI;
      lobbyIndex = i;
      break;
    }
  }
  return { userIndex, lobbyIndex };
}