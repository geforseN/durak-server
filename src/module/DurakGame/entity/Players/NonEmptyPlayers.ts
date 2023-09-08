import type { BasePlayer } from "../Player/BasePlayer.abstract.js";
import type DurakGame from "../../DurakGame.js";

export class NonEmptyPlayers {
  value;

  constructor(game: DurakGame) {
    this.value = game.players.value.reduce(
      (
        obj: {
          playersToLeave: BasePlayer[];
          playersToStay: BasePlayer[];
        },
        player: BasePlayer,
      ) => {
        if (player.hand.isEmpty) {
          obj.playersToLeave.push(player);
        } else {
          obj.playersToStay.push(player);
        }
        return obj;
      },
      {
        playersToLeave: [] as BasePlayer[],
        playersToStay: [] as BasePlayer[],
      },
    );
  }
}
