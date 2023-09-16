import { GameRound, Players } from "../index.js";
import type DurakGame from "../../DurakGame.js";
import { BasePlayer } from "../Player/BasePlayer.abstract.js";

export abstract class RoundEnd {
  constructor(protected game: DurakGame) {}

  kind = "RoundEnd" as const;

  protected prepareBeforeNewGameRound() {
    if (!this.game.talon.isEmpty) {
      return this.game.talonDistribution.makeDistribution();
    }
    const groupedPlayers = getGropedPlayers([...this.game.players]);
    this.game.players = new Players(groupedPlayers.toStay);
    groupedPlayers.toLeave; // TODO let playersToLeave exit game
    if (this.game.players.count === 1) {
      throw new Error("One player remained. Game must be over");
    } else if (this.game.players.count === 1) {
      throw new Error("Game must be ended wit a draw");
    }
  }

  abstract get newGameRound(): GameRound | undefined;
}

function getGropedPlayers(players: BasePlayer[]) {
  return players.reduce(
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
}
