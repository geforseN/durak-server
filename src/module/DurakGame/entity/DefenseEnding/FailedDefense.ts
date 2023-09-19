import type DurakGame from "../../DurakGame.js";
import type { BasePlayer } from "../Player/BasePlayer.abstract.js";

import { Players } from "../index.js";
import GameRound from "./../GameRound/index.js";

export default class FailedDefense {
  game: DurakGame;

  constructor(game: DurakGame) {
    this.game = game;
  }

  makeMutation() {
    this.game.desk.provideCards(this.game.players.defender);
  }

  protected prepareBeforeNewGameRound() {
    if (this.game.talon.count) {
      return this.game.talonDistribution.makeDistribution();
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

  get kind() {
    return "RoundEnd";
  }

  get newGameRound() {
    try {
      this.prepareBeforeNewGameRound();
      this.game.players
        .mutateWith(this.game.players.allowed.asDisallowed())
        .mutateWith(this.game.players.attacker.asPlayer())
        .mutateWith(this.game.players.defender.left.left.asDefender())
        .mutateWith(
          this.game.players.defender.right.asAttacker().asAllowed(this.game),
        );
      return this.game.round.nextRound();
    } catch {
      return undefined; // FIXME should return GameEnd instance;
    }
  }
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
