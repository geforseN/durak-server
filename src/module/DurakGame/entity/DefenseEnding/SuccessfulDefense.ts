import { BasePlayer } from "../Player/BasePlayer.abstract.js";
import { GameRound, Players } from "../index.js";

class SuccessfulDefense {
  kind = "RoundEnd" as const;

  constructor(protected game: DurakGame) {}

  makeMutation(): void {
    this.game.desk.provideCards(this.game.discard);
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

  get newGameRound() {
    try {
      this.prepareBeforeNewGameRound();
      this.game.players
        .mutateWith(this.game.players.allowed.asDisallowed())
        .mutateWith(this.game.players.attacker.asPlayer())
        .mutateWith(this.game.players.defender.left.asDefender())
        .mutateWith(
          this.game.players.defender.asAttacker().asAllowed(this.game),
        );
      return this.game.round.nextRound();
    } catch {
      return undefined; // FIXME should return GameEnd instance;
    }
  }
}

export { SuccessfulDefense as default };

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
