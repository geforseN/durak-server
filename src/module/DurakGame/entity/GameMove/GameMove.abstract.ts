import type DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../Player/AllowedSuperPlayer.abstract.js";
import type { RoundEnd } from "../DefenseEnding/index.js";
import InsertGameMove from "./InsertGameMove.abstract.js";

export interface CanCommandNextMove {
  //                                                             TODO or not TODO ...
  calculateNextThingToDoInGame(): AllowedSuperPlayer | RoundEnd; // | GameEnd;
}

export interface CardInsert {}

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

  get latestPerformer() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  emitContextToPlayers() {
    // TODO
    // TODO
    // TODO emit without allowedPlayerId data
    this.game.info.namespace.to(this.performer.id).emit();
    // TODO above
    this.game.info.namespace.emit("move::new", {
      move: {
        allowedPlayer: { id: this.performer.id },
        name: this.constructor.name,
        endTime: { UTC: this.performer.defaultBehavior.callTime?.UTC },
        timeToMove: this.game.settings.moveTime,
      },
    });
  }
}
