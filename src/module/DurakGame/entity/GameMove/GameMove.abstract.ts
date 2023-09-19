import type DurakGame from "../../DurakGame.js";
import type { default as RoundEnd } from "../DefenseEnding/RoundEnd.js";
import type { AllowedAttacker } from "../Player/AllowedAttacker.js";

import { AllowedDefender } from "../Player/AllowedDefender.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import InsertGameMove from "./InsertGameMove.abstract.js";

export default abstract class GameMove<ASP extends AllowedSuperPlayer> {
  game: DurakGame;
  performer: ASP;

  protected strategies = {
    letDefenderMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(this.game.players.defender.asAllowed(this.game));
    },
    letNextPossibleAttackerMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(
          this.game.round.nextAttacker.asAttacker().asAllowed(this.game),
        );
    },
    letPerformerMoveAgain: () => {
      this.game.players.mutateWith(this.performer.asAllowedAgain());
     },
    letPrimalAttackerMove: () => {
      this.game.players
        .mutateWith(this.performer.asDisallowed())
        .mutateWith(
          this.game.round.primalAttacker.asAttacker().asAllowed(this.game),
        );
    },
  };

  protected constructor(game: DurakGame, performer: ASP) {
    this.game = game;
    this.performer = performer;
  }

  emitContextToPlayers() {
    this.game.info.namespace.to(this.performer.id).emit("move::new", {
      move: {
        name: this.constructor.name,
      },
    });
    this.game.info.namespace.except(this.performer.id).emit("move::new", {
      move: {
        name: this.constructor.name,
        performer: { id: this.performer.id },
      },
    });
  }

  isDoneByAttacker(): this is GameMove<AllowedAttacker> {
    return this.performer.isAllowedAttacker();
  }

  isDoneByDefender(): this is GameMove<AllowedDefender> {
    return this.performer.isAllowedDefender();
  }

  isInsertMove(): this is InsertGameMove<ASP> {
    return false;
  }

  isTransferMove() {
    return false;
  }

  get latestPerformer() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  abstract get gameMutationStrategy():
    | NewRoundCallback
    | PlayerMutationCallback;
}

type PlayerMutationCallback = () => void;
type NewRoundCallback = () => RoundEnd;
