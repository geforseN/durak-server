import { GameRound, Players } from "../index.js";
import type DurakGame from "../../DurakGame.js";
import { NonEmptyPlayers } from "../Players/NonEmptyPlayers.js";
import { BasePlayer } from "../Player/BasePlayer.abstract.js";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  kind = "RoundEnd" as const;

  prepareBeforeNewGameRound() {
    if (this.game.talon.isEmpty) {
      const groupedPlayers = this.game.players.value.reduce(
        (
          gropedPlayers: {
            toLeave: BasePlayer[];
            toStay: BasePlayer[];
          },
          player: BasePlayer,
        ) => {
          if (player.hand.isEmpty) {
            gropedPlayers.toLeave.push(player);
          } else {
            gropedPlayers.toStay.push(player);
          }
          return gropedPlayers;
        },
        {
          toLeave: Array<BasePlayer>(),
          toStay: Array<BasePlayer>(),
        },
      );
      this.game.players = new Players(groupedPlayers.toStay);
      groupedPlayers.toLeave; // TODO let playersToLeave exit game
      if (this.game.players.count === 1) {
        throw new Error("One player remained. Game must be over");
      } else if (this.game.players.count === 1) {
        throw new Error("Game must be ended wit a draw");
      }
    } else {
      this.game.distribution.makeDistribution();
    }
  }

  abstract get newGameRound(): GameRound | undefined;
}
