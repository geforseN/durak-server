import Player from "./Players/Player";
import Attacker from "./Players/Attacker";
import { AttackerMove } from "./Moves/AttackerMove";
import { DefenderMove } from "./Moves/DefenderMove";
import { InsertDefendCardMove } from "./Moves/InsertDefendCardMove";
import { GameMove, GameMoveConstructorArgs } from "./Moves/GameMove";
import Desk from "./Desk";
import { TransferMove } from "./Moves/TransferMove.Defender";
import { StopDefenseMove } from "./Moves/StopDefenseMove";
import { GameService } from "../../namespaces/games/game.service";
import Defender from "./Players/Defender";

type GameRoundConstructorArgs = { attacker: Attacker, number: number, desk: Desk, service: GameService };

export default class GameRound {
  number: number;
  private readonly moves: GameMove[];
  originalAttacker: Attacker | null;
  desk: Desk;
  service: GameService;

  constructor({ number, desk, attacker: allowedPlayer, service }: GameRoundConstructorArgs) {
    this.number = number;
    this.originalAttacker = null;
    this.desk = desk;
    this.moves = [new AttackerMove({ number: 1, allowedPlayer, deskCardCount: desk.cardCount })];
    this.service = service;
    this.service.setAttackUI("revealed", allowedPlayer);
  }

  get currentMoveIndex(): number {
    return this.moves.length - 1;
  }

  get previousMove(): GameMove {
    return this.moves[this.currentMoveIndex - 1];
  }

  get currentMove(): GameMove {
    return this.moves[this.currentMoveIndex];
  }

  set currentMove(move: GameMove) {
    this.moves[this.currentMoveIndex] = move;
  }

  currentMoveAllowedTo({ info: { accname } }: Player): boolean {
    return this.currentMove.allowedPlayerAccname === accname;
  }

  get isDefenderGaveUp() {
    return this.moves.some((move) => move instanceof StopDefenseMove);
  }

  get defenderGaveUpAtPreviousMove(): boolean {
    return this.previousMove instanceof StopDefenseMove;
  }

  pushNextMove<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    moveConstructorArgs: Partial<InstanceType<{ new(arg: GameMoveConstructorArgs<Player>): M }>> & { allowedPlayer: Player },
  ) {
    const { currentMove: { number }, desk: { cardCount: deskCardCount } } = this;
    const { allowedPlayer } = moveConstructorArgs;
    this.service.setSuperPlayerUI("revealed", allowedPlayer as Defender | Attacker);
    this.moves.push(new MoveConstructor({ number: number + 1, deskCardCount, ...moveConstructorArgs }));
  }

  get lastSuccesfullDefense(): DefenderMove | undefined {
    for (let i = this.moves.length - 1; i > 0; i--) {
      const currentMove = this.moves[i];
      const previousMove = this.moves[i - 1];
      const previousMoveWasDefence = previousMove instanceof InsertDefendCardMove;
      const currentMoveIsAttack = currentMove instanceof AttackerMove;
      if (previousMoveWasDefence && currentMoveIsAttack) return previousMove;
    }
  }

  updateCurrentMoveTo<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    args: Partial<InstanceType<{ new(...args: any): M }>>,
  ) {
    const { currentMove: { number, allowedPlayer }, desk: { cardCount: deskCardCount } } = this;
    this.currentMove = new MoveConstructor({ allowedPlayer, number, deskCardCount, ...args });
  }

  get _tryFirstDefenderMove_(): DefenderMove {
    const a = this.moves.find((move) => move instanceof InsertDefendCardMove);
    if (!a) throw new Error("Нет защищающегося хода");
    return a;
  }

  get _tryOriginalAttacker_(): Attacker {
    return this._tryFirstDefenderMove_.allowedPlayer.right as Attacker;
  }

  isOriginalAttacker({ info: { accname } }: Player) {
    return this.originalAttacker?.info.accname === accname;
  }

  isRealDefenderMove(move: GameMove) {
    return move instanceof DefenderMove && !(move instanceof TransferMove);
  }

  get distributionQueue() {
    if (!this.originalAttacker) throw new Error("Нет оригинального атакующего");
    const playersQueue: Player[] = [this.originalAttacker];
    const defender = this.originalAttacker.left;

    let player = defender.left;
    while (player.left.info.accname !== defender.info.accname) {
      playersQueue.push(player);
      player = player.left;
    }

    return playersQueue.concat(defender);
  }
}
