import assert from "node:assert";
import { Attacker, Defender, Player } from "./Players";
import {
  AttackerMove,
  DefenderGaveUpMove,
  DefenderMove,
  GameMove, InsertAttackCardMove,
  InsertDefendCardMove, StopAttackMove, StopDefenseMove, TransferMove,
} from "./GameMove";
import GameRoundService from "./Services/Round.service";
import DurakGame from "../DurakGame";
import Card from "./Card";

export default class GameRound {
  readonly number: number;
  private readonly moves: GameMove<Defender | Attacker>[];
  private readonly service?: GameRoundService;
  game: DurakGame;

  constructor({ number, game }: { number: number, game: DurakGame }) {
    if (!game.info.namespace) throw new Error("Socket namespace not found");
    this.service = new GameRoundService(game.info.namespace);
    this.game = game;
    this.number = number;
    this.moves = [];
    this.#pushNextMove(AttackerMove, { player: game.players.attacker });
  }

  get previousMove(): GameMove<Defender | Attacker> {
    return this.moves[this.#currentMoveIndex - 1];
  }

  get currentMove(): GameMove<Defender | Attacker> {
    return this.moves[this.#currentMoveIndex];
  }

  set currentMove(move: GameMove<Defender | Attacker>) {
    this.moves[this.#currentMoveIndex] = move;
    if (move instanceof DefenderGaveUpMove) {
      this.service?.emitDefenderGaveUp();
    }
  }

  get #currentMoveIndex(): number {
    return this.moves.length - 1;
  }

  isCurrentMoveAllowedTo(player: Player): boolean {
    return this.currentMove.player.id === player.id;
  }

  get isDefenderGaveUp() {
    return !!this.moves.findLast((move) => move instanceof DefenderGaveUpMove);
  }

  #pushNextMove<M extends GameMove<Defender | Attacker>>(
    UncertainMove: { new(arg: any): M },
    moveContext: Required<Pick<M, "player">>,
  ) {
    clearTimeout(this.currentMove?.defaultBehaviour);
    this.moves.push(new UncertainMove({
      game: this.game,
      player: moveContext.player,
    }));
    this.service?.letMoveTo(moveContext.player, Date.now() + this.game.settings.moveTime);
  }

  #updateCurrentMoveTo<M extends GameMove<Attacker | Defender>>(
    CertainMove: { new(arg: any): M },
    moveContext: Partial<M> = {},
  ) {
    clearTimeout(this.currentMove.defaultBehaviour);
    this.currentMove = new CertainMove({
      game: this.game,
      player: moveContext.player ?? this.currentMove.player,
      ...moveContext,
    });
  }

  get firstDefenderMove(): DefenderMove | never {
    const defenderMove = this.moves.find((move) =>
      move instanceof InsertDefendCardMove
      || move instanceof DefenderGaveUpMove,
    );
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

  giveDefenderDefend() {
    return this.#pushNextMove(DefenderMove, { player: this.game.players.defender });
  }

  giveDefenderLastChance() {
    return this.giveDefenderDefend();
  }

  giveAttackerAttack() {
    return this.#pushNextMove(AttackerMove, { player: this.game.players.attacker });
  }

  givePrimalAttackerAttack() {
    return this.game.round.#pushNextMove(AttackerMove, {
      player: this.game.players.manager.makeNewAttacker(this.game.round.primalAttacker),
    });
  }

  giveNextAttackerAttack() {
    return this.#pushNextMove(AttackerMove, {
      player: this.game.players.manager.makeNewAttacker(this.nextAttacker),
    });
  }

  giveAttackerLeftDefend() {
    return this.#pushNextMove(DefenderMove, {
      player: this.game.players.manager.makeDefender(this.game.players.attacker.left),
    });
  }

  makeDefendInsertMove(card: Card, slotIndex: number) {
    this.updateCurrentMoveTo(InsertDefendCardMove, { card, slotIndex });
    assert.ok(this.currentMove instanceof InsertDefendCardMove, "(-_-)");
    return this.currentMove.handleAfterCardInsert();
  }

  makeAttackInsertMove(card: Card, slotIndex: number) {
    this.updateCurrentMoveTo(InsertAttackCardMove, { card, slotIndex });
    assert.ok(this.currentMove instanceof InsertAttackCardMove, "(-_-)");
    return this.currentMove.handleAfterCardInsert();
  }
}
