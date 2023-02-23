import Player from "./Players/Player";
import Attacker from "./Players/Attacker";
import { AttackerMove } from "./Moves/AttackerMove";
import { DefenderMove } from "./Moves/DefenderMove";
import { InsertDefendCardMove } from "./Moves/InsertDefendCardMove";
import { GameMove } from "./Moves/GameMove";
import Desk from "./Desk";

type GameRoundConstructorArgs = { attacker: Attacker, number: number, desk: Desk };

export default class GameRound {
  number: number;
  private moves: GameMove[];
  principalAttacker: Attacker | Player | null;
  desk: Desk;

  constructor({ number, desk, attacker: allowedPlayer }: GameRoundConstructorArgs) {
    this.number = number;
    this.moves = [new AttackerMove({ number: 1, allowedPlayer })];
    this.principalAttacker = null;
    this.desk = desk;
  }

  get currentMoveIndex(): number {
    return this.moves.length - 1;
  }

  get currentMove(): GameMove {
    return this.moves[this.currentMoveIndex];
  }

  set currentMove(move: GameMove) {
    this.moves[this.currentMoveIndex] = move;
  }

  pushNextMove<M extends GameMove>(MoveConstructor: { new(...args: any): M }, moveConstructorArgs: Partial<InstanceType<{ new(...args: any): M }>>) {
    this.moves.push(new MoveConstructor({ ...moveConstructorArgs, number: this.currentMove.number + 1 }));
  }

  get lastSuccesfullDefense(): DefenderMove | undefined {
    return [...this.moves].reverse().find(
      (move) => move instanceof DefenderMove,
    ) as DefenderMove;
  }

  updateCurrentMoveTo<M extends GameMove>(MoveConstructor: { new(...args: any): M }, args: Partial<InstanceType<{ new(...args: any): M }>>) {
    const { currentMove: { number } } = this;
    this.currentMove = new MoveConstructor({ ...args, number });
  }

  get _firstDefenderMove_(): DefenderMove | undefined {
    return this.moves.find((move) => move instanceof InsertDefendCardMove) as DefenderMove;
  }

  get _originalAttacker_(): Attacker | undefined {
    return this._firstDefenderMove_?.allowedPlayer.right as Attacker;
  }

  isPrincipalAttacker({ info: { accname } }: Player) {
    return this.principalAttacker?.info.accname === accname;
  }
}
