import type {
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  TransferMove,
} from ".";
import type DurakGame from "../../DurakGame";
import type Card from "../Card";
import { CardInsert } from "../GameRound/CardInsert.interface";
import { Attacker, Defender } from "../Player";
import type Player from "../Player/Player";
import type DefaultBehavior from "./DefaultBehavior";

export abstract class GameMove {
  game: DurakGame;
  abstract performer: Player;
  abstract defaultBehavior: DefaultBehavior<GameMove>;
  isInsertMove: boolean;
  abstract insertCardOnDesk?: Function;

  protected constructor(game: DurakGame) {
    this.game = game;
    this.isInsertMove = false;
  }

  _isInsertMove(): this is CardInsert {
    return (
      Object.hasOwn(this, "insertCardOnDesk") &&
      typeof this.insertCardOnDesk == "function"
    );
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
    performer: CertainMove extends
      | typeof StopAttackMove
      | typeof InsertAttackCardMove
      ? Attacker
      : Defender,
    context: CertainMove extends
      | typeof InsertAttackCardMove
      | typeof TransferMove
      | typeof InsertDefendCardMove
      ? { card: Card; slotIndex: number }
      : Record<string, never>,
  ): void {
    this.defaultBehavior.stop();
    this.game.round.currentMove = new Move(this.game, {
      performer,
      ...context,
    });
  }
}

export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export default GameMove;
