import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type { RoundEnd } from "../DefenseEnding/index.js";
import InsertGameMove from "./InsertGameMove.abstract.js";
import type { AllowedAttacker } from "../Player/AllowedAttacker.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";

export default abstract class GameMove<ASP extends AllowedSuperPlayer> {
  game: DurakGame;
  performer: ASP;

  protected constructor(game: DurakGame, performer: ASP) {
    this.game = game;
    this.performer = performer;
  }

  isInsertMove(): this is InsertGameMove<ASP> {
    return false;
  }

  isTransferMove() {
    return false;
  }

  isDoneByAttacker(): this is GameMove<AllowedAttacker> {
    return this.performer.isAllowedAttacker();
  }

  isDoneByDefender(): this is GameMove<AllowedDefender> {
    return this.performer.isAllowedDefender();
  }

  get latestPerformer() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  emitContextToPlayers() {
    this.game.info.namespace.to(this.performer.id).emit("move::new", {
      move: {
        name: this.constructor.name,
      },
    });
    this.game.info.namespace.except(this.performer.id).emit("move::new", {
      move: {
        performer: { id: this.performer.id },
        name: this.constructor.name,
      },
    });
  }

  protected strategies = {
    letPrimalAttackerMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(
          this.game.round.primalAttacker.asAttacker().asAllowed(this.game),
        );
      // assert.ok(this.game.players.attacker.isAllowed());
      // return this.game.players.attacker;
    },
    letDefenderMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(this.game.players.defender.asAllowed(this.game));
      // assert.ok(this.game.players.defender.isAllowed());
      // return this.game.players.defender;
    },
    letPerformerMoveAgain: () => {
      this.game.players.mutateWith(this.performer.asAllowedAgain());
      // return this.performer.asLatest();
    },
    letNextPossibleAttackerMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(
          this.game.round.nextAttacker.asAttacker().asAllowed(this.game),
        );
      // assert.ok(this.game.players.attacker.isAllowed());
      // return this.game.players.attacker;
    },
  };

  abstract get gameMutationStrategy():
    | PlayerMutationCallback
    | NewRoundCallback;
}

type PlayerMutationCallback = () => void;
type NewRoundCallback = () => RoundEnd;
