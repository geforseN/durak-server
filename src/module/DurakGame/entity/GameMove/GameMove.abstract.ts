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
import DefaultBehavior from "./DefaultBehavior";

export abstract class GameMove {
  game: DurakGame;
  abstract performer: Player;
  abstract defaultBehavior: DefaultBehavior<GameMove>;
  isInsertMove: boolean;

  protected constructor(game: DurakGame) {
    this.game = game;
    this.isInsertMove = false;
  }

  get player() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  emitContextToPlayers() {
    this.game.info.namespace.emit("move::new", {
      move: {
        allowedPlayer: { id: this.player.id },
        name: this.constructor.name,
        endTime: { UTC: this.defaultBehavior.callTime.UTC },
        timeToMove: this.game.settings.moveTime,
      },
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
    // TODO: fix type of context
    // | { performer: Player }
    // | { performer: Player; card: Card; slotIndex: number },
    context: void | Record<string, never> | { card: Card; slotIndex: number },
  ): void {
    this.defaultBehavior.stop();
    this.game.round.currentMove = new Move(this.game, context);
  }
}

export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export default GameMove;
