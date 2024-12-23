import type DurakGame from "@/module/DurakGame/DurakGame.js";
import type { default as RoundEnd } from "@/module/DurakGame/entity/DefenseEnding/RoundEnd.js";
import type { AllowedAttacker } from "@/module/DurakGame/entity/Player/AllowedAttacker.js";

import { AllowedDefender } from "@/module/DurakGame/entity/Player/AllowedDefender.js";
import { AllowedSuperPlayer } from "@/module/DurakGame/entity/Player/AllowedSuperPlayer.abstract.js";
import InsertGameMove from "@/module/DurakGame/entity/GameMove/InsertGameMove.abstract.js";

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

  // TODO: return instance with execute
  // this will help to avoid code duplication
  abstract get gameMutationStrategy():
    | NewRoundCallback
    | PlayerMutationCallback;
}

type PlayerMutationCallback = () => void;
type NewRoundCallback = () => RoundEnd;
