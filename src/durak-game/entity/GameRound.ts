import Player from "./Players/Player";
import Attacker from "./Players/Attacker";
import { AttackerMove } from "./Moves/AttackerMove";
import { DefenderMove } from "./Moves/DefenderMove";
import { InsertDefendCardMove } from "./Moves/InsertDefendCardMove";
import { GameMove, GameMoveConstructorArgs } from "./Moves/GameMove";
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

  currentMoveAllowedTo({ info: { accname } }: Player): boolean {
    return this.currentMove.allowedPlayerAccname === accname;
  }

  set currentMove(move: GameMove) {
    this.moves[this.currentMoveIndex] = move;
  }

  pushNextMove<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    moveConstructorArgs: Partial<InstanceType<{ new(arg: GameMoveConstructorArgs<Player>): M }>> & { allowedPlayer: Player }
  ) {
    const { currentMove: { number }, desk: { cardCount: deskCardCount } } = this;
    this.moves.push(new MoveConstructor({ number: number + 1, deskCardCount, ...moveConstructorArgs }));
  }

  get lastSuccesfullDefense(): DefenderMove | undefined {
    return [...this.moves].reverse().find(
      (move) => move instanceof DefenderMove,
    ) as DefenderMove;
  }

  updateCurrentMoveTo<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    args: Partial<InstanceType<{ new(...args: any): M }>>
  ) {
    const { currentMove: { number, allowedPlayer }, desk: { cardCount: deskCardCount } } = this;
    this.currentMove = new MoveConstructor({ allowedPlayer, number, deskCardCount, ...args });
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
