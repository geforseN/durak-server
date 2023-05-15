import assert from "node:assert";
import { Attacker, Defender, Player, SuperPlayer } from "./Players";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  GameMove,
  InsertDefendCardMove,
} from "./GameMove";
import GameRoundService from "./Services/Round.service";
import DurakGame from "../DurakGame";

export default class GameRound {
  readonly number: number;
  private readonly moves: GameMove<SuperPlayer>[];
  private readonly service?: GameRoundService;
  game: DurakGame;

  constructor({ number, game }: { number: number, game: DurakGame }) {
    if (!game.info.namespace) throw new Error("Socket namespace not found");
    this.service = new GameRoundService(game.info.namespace);
    this.game = game;
    this.number = number;
    this.moves = [];
    this.pushNextMove(AttackerMove, {
      player: game.players.attacker,
    });
  }

  get previousMove(): GameMove<SuperPlayer> {
    return this.moves[this.currentMoveIndex - 1];
  }

  get currentMove(): GameMove<SuperPlayer> {
    return this.moves[this.currentMoveIndex];
  }

  set currentMove(move: GameMove<SuperPlayer>) {
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

  pushNextMove<M extends GameMove<SuperPlayer>>(
    UncertainMove: { new(arg: any): M },
    moveContext: Required<Pick<M, "player">>,
  ) {
    const { desk: { cardCount: deskCardCount } } = this;
    this.moves.push(new Move({ deskCardCount, ...moveContext }));
    this.service?.letMoveTo(moveContext.player);
  }

  updateCurrentMoveTo<M extends GameMove<SuperPlayer>>(
    CertainMove: { new(arg: any): M },
    moveContext: { player?: M["player"] } = {},
  ) {
    const { currentMove: { player }, desk: { cardCount: deskCardCount } } = this;
    this.currentMove = new Move({ player, deskCardCount, ...moveContext });
    if (Move === DefenderGaveUpMove) {
      this.service?.emitDefenderGaveUp();
    }
  }

  get firstDefenderMove(): DefenderMove | never {
    const defenderMove = this.moves.find((move) => move instanceof InsertDefendCardMove || move instanceof DefenderGaveUpMove);
    assert.ok(defenderMove, "Нет защищающегося хода");
    assert.ok(defenderMove instanceof DefenderMove, "Ход не является защищающимся");
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
