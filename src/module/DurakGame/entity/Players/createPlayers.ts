import type GamePlayerWebsocketService from "../Player/Player.service.js";

import NonStartedDurakGame from "../../NonStartedDurakGame.js";
import { Hand } from "../Deck/index.js";
import NonStartedGameUser from "../Player/NonStartedGameUser.js";
import { Player } from "../Player/Player.js";
import { Players } from "./Players.js";

export default function createPlayers(nonStartedGame: NonStartedDurakGame, service: GamePlayerWebsocketService) {
  const playersData = nonStartedGame.usersInfo
    .map(
      (info, index, array) =>
        new NonStartedGameUser({
          hand: new Hand(),
          index,
          info,
          lobbySlotsCount: array.length,
          wsService: service,
        }),
    )
    .map((user) => Player.create(user));
  const players = playersData.map((data) => data[1]);
  playersData.forEach(([leftPlayerIndex, player, rightPlayerIndex]) => {
    player.left = players[leftPlayerIndex];
    player.right = players[rightPlayerIndex];
  });
  return new Players(players);
}
