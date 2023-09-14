import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type { RoundEnd } from "../DefenseEnding/index.js";
import InsertGameMove from "./InsertGameMove.abstract.js";
import type { AllowedAttacker } from "../Player/AllowedAttacker.js";
import { AllowedDefender } from "../Player/AllowedDefender.js";

export interface CanCommandNextMove {
  //                                                             TODO or not TODO ...
  calculateNextThingToDoInGame(): AllowedSuperPlayer | RoundEnd; // | GameEnd;
}

export default abstract class GameMove<ASP extends AllowedSuperPlayer>
  implements CanCommandNextMove
{
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

  abstract calculateNextThingToDoInGame(): AllowedSuperPlayer | RoundEnd;
}
