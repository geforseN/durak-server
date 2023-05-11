import assert from "node:assert";
import Desk from "./Desk";
import { Attacker, Defender, Player } from "./Players";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  GameMove,
  InsertDefendCardMove,
} from "./GameMove";
import GameRoundService from "./Services/Round.service";
import { GamesIO } from "../../namespaces/games/games.types";

type GameRoundConstructorArgs = { attacker: Attacker, number: number, desk: Desk, namespace: GamesIO.NamespaceIO };

export default class GameRound {
  readonly number: number;
  private readonly moves: GameMove[];
  private readonly desk: Desk;
  private readonly service?: GameRoundService;

  constructor({ number, desk, attacker, namespace }: GameRoundConstructorArgs) {
    this.number = number;
    this.desk = desk;
    this.moves = [];
    this.service = new GameRoundService(namespace);
    this.pushNextMove(AttackerMove, {
      player: attacker,
      deskCardCount: desk.cardCount,
    });
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

  private get currentMoveIndex(): number {
    return this.moves.length - 1;
  }

  currentMoveAllowedTo(player: Player): boolean {
    return this.currentMove.player.id === player.id;
  }

  get isDefenderGaveUp() {
    return this.moves.some((move) => move instanceof DefenderGaveUpMove);
  }

  pushNextMove<M extends GameMove>(
    Move: { new(arg: any): M },
    moveContext: Partial<InstanceType<{ new(arg: any): M }>> & Required<Pick<M, "player">>, // or Just M["player"] ???
  ) {
    const { desk: { cardCount: deskCardCount } } = this;
    this.moves.push(new Move({ deskCardCount, ...moveContext }));
    this.service?.letMoveTo(moveContext.player);
  }

  updateCurrentMoveTo<M extends GameMove>(
    Move: { new(arg: any): M },
    moveContext: Partial<InstanceType<{ new(arg: any): M }>>,
  ) {
    const { currentMove: { player }, desk: { cardCount: deskCardCount } } = this;
    this.currentMove = new Move({ player, deskCardCount, ...moveContext });
  }

  get firstDefenderMove(): DefenderMove | never {
    const defenderMove = this.moves.find((move) => move instanceof InsertDefendCardMove || move instanceof DefenderGaveUpMove);
    assert.ok(defenderMove, "Нет защищающегося хода");
    return defenderMove;
  }

  get primalAttacker(): Attacker | never {
    return this.firstDefenderMove.player.right as Attacker;
  }

  get hasPrimalAttacker(): boolean {
    try {
      return !!this.primalAttacker;
    } catch {
      return false;
    }
  };

  get distributionQueue() {
    const playersQueue: Player[] = [this.primalAttacker];
    let player = this.defender.left;
    while (!player.isPrimalAttacker({ round: this })) {
      playersQueue.push(player);
      player = player.left;
    }
    playersQueue.push(this.defender);
    return playersQueue;
  }

  private get defender(): Defender | never {
    return this.primalAttacker.left as Defender;
  }
}
