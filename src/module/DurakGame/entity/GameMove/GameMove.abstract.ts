import type Player from "../Player/Player";
import type DurakGame from "../../DurakGame";
import type {
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  TransferMove,
} from ".";
import Card from "../Card";

export abstract class GameMove {
  game: DurakGame;
  abstract performer: Player;
  abstract defaultBehavior: XDDDDDDDDDDDDDDDDDDDDDDD;
  isInsertMove: boolean;

  protected constructor(game: DurakGame) {
    this.game = game;
    this.isInsertMove = false;
  }

  get player() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  emitOwnData() {
    this.game.info.namespace.emit("game::move::new", {
      name: this.constructor.name,
      allowedPlayerId: this.player.id,
    });
  }

  emitContext() {
    this.game.info.namespace.emit("player__allowedToMove", {
      allowedPlayerId: this.player.id,
      moveEndTimeInUTC: this.defaultBehavior,
      moveTimeInSeconds: this.game.settings.moveTime,
    });
  }

  updateTo<
    CertainMove extends
      | typeof StopAttackMove
      | typeof StopDefenseMove
      | typeof InsertAttackCardMove
      | typeof InsertDefendCardMove
      | typeof TransferMove,
  >(
    Move: CertainMove,
    context?: Record<string, never> | { card: Card; slotIndex: number },
    // | { performer: Player }
    // | { performer: Player; card: Card; slotIndex: number },
  ): void {
    this.defaultBehavior.stop();
    this.game.round.currentMove = new Move(this.game, context);
  }
}

export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export default GameMove;
