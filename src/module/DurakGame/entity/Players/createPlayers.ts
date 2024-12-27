import NonStartedDurakGame from "@/module/DurakGame/NonStartedDurakGame.js";
import { Hand } from "@/module/DurakGame/entity/Deck/index.js";
import NonStartedGameUser from "@/module/DurakGame/entity/Player/NonStartedGameUser.js";
import { Player } from "@/module/DurakGame/entity/Player/Player.js";
import { Players } from "@/module/DurakGame/entity/Players/Players.js";

export default function createPlayers(
  nonStartedGame: NonStartedDurakGame,
) {
  const playersData = nonStartedGame.usersInfo
    .map(
      (info, index, array) =>
        new NonStartedGameUser({
          hand: new Hand(),
          index,
          info,
          lobbySlotsCount: array.length,
        }),
    )
    .map((user) => Player.create(user));
  const players = playersData.map((data) => data[1]);
  playersData.forEach(([leftIndex, player, rightIndex]) => {
    player.addSidePlayers(players[leftIndex], players[rightIndex]);
  });
  return new Players(players);
}
