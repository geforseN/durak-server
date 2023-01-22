import { lobbies } from "../game-lobbies.handler";

export default function logLobbies() {
  lobbies.forEach(({ id, settings, ...lobby }, index) => {
    const users = lobby.users.map(user => Object.entries(user).map(([key, value]) => `${key}: ${value}`));
    console.log(index, {
      id,
      settings,
      users,
    });
  });
}