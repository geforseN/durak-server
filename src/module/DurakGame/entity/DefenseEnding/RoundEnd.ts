import type DurakGame from "@/module/DurakGame/DurakGame.js";

import { BasePlayer } from "@/module/DurakGame/entity/Player/BasePlayer.abstract.js";
import { GameRound, Players } from "@/module/DurakGame/entity/index.js";

export default abstract class RoundEnd {
  kind = "RoundEnd" as const;

  constructor(protected game: DurakGame) {}

  protected prepareBeforeNewGameRound() {
    if (this.game.talon.count) {
      return this.game.talon.distribution.execute();
    }
    const groupedPlayers = getGropedPlayers([...this.game.players]);
    this.game.players = new Players(groupedPlayers.toStay);
    // TODO let playersToLeave exit game
    groupedPlayers.toLeave;
    if (this.game.players.count === 1) {
      throw new Error("One player remained. Game must be over");
    } else if (this.game.players.count === 0) {
      throw new Error("Game must be ended wit a draw");
    }
  }

  abstract makeMutation(): void

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
      if (player.cards.isEmpty) {
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
