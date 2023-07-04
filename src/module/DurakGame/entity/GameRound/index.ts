import assert from "node:assert";
import { Attacker, Defender, Player } from "../Player";
import {
  GameMove,
  TransferMove,
  DefenderGaveUpMove,
  AttackerMove,
  StopAttackMove,
  InsertAttackCardMove,
  DefenderMove,
  StopDefenseMove,
  InsertDefendCardMove,
} from "../GameMove";
import GameRoundService from "./GameRound.service";
import type DurakGame from "../../DurakGame.implimetntation";
import type Card from "../Card";

export default class GameRound {
  readonly number: number;
  readonly #moves: GameMove<Defender | Attacker>[];
  readonly #wsService: GameRoundService;
  readonly game: DurakGame;

  constructor(game: DurakGame, wsService: GameRoundService);
  constructor(game: DurakGame);
  constructor(game: DurakGame, wsService?: GameRoundService) {
    this.#wsService = wsService || game.round.#wsService;
    this.game = game;
    this.number = !game.round ? 1 : game.round.number + 1;
    this.#moves = []; // TODO new GameRoundMoves
    this.#pushNextMove(AttackerMove, { player: game.players.attacker });
  }

  get previousMove(): GameMove<Defender | Attacker> {
    return this.#moves[this.#currentMoveIndex - 1];
  }

  get currentMove(): GameMove<Defender | Attacker> {
    return this.#moves[this.#currentMoveIndex];
  }

  set #currentMove(move: GameMove<Defender | Attacker>) {
    this.#moves[this.#currentMoveIndex] = move;
    if (move instanceof DefenderGaveUpMove) {
      this.#wsService?.emitDefenderGaveUp(this);
    }
  }

  get #currentMoveIndex(): number {
    return this.#moves.length - 1;
  }

  get isDefenderGaveUp() {
    return !!this.#moves.findLast((move) => move instanceof DefenderGaveUpMove);
  }

  #pushNextMove<M extends GameMove<Defender | Attacker>>(
    UncertainMove: { new (arg: any): M },
    moveContext: { player: M["player"] },
  ) {
    clearTimeout(this.currentMove?.defaultBehaviour);
    this.#moves.push(
      new UncertainMove({
        game: this.game,
        player: moveContext.player,
      }),
    );
    this.#wsService?.letMoveToPlayer(this);
  }

  get firstDefenderMove(): DefenderMove | never {
    const firstDefenderMove = this.#moves.find(
      (move): move is DefenderMove =>
        move instanceof DefenderMove && !(move instanceof TransferMove),
    );
    // (move: GameMove<Attacker | Defender>): move is DefenderMove =>
    // (move instanceof InsertDefendCardMove ||
    // move instanceof DefenderGaveUpMove) &&
    // move instanceof DefenderMove;
    assert.ok(firstDefenderMove, "Нет защищающегося хода");
    return firstDefenderMove;
  }

  get primalAttacker(): Attacker | never {
    assert.ok(this.firstDefenderMove.player.right instanceof Attacker);
    return this.firstDefenderMove.player.right;
  }

  get #nextAttacker(): Player {
    return this.game.players.attacker === this.primalAttacker
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  giveDefenderDefend() {
    return this.#pushNextMove(DefenderMove, {
      player: this.game.players.defender,
    });
  }

  giveAttackerAttack() {
    return this.#pushNextMove(AttackerMove, {
      player: this.game.players.attacker,
    });
  }

  givePrimalAttackerAttack() {
    this.game.players.attacker = this.primalAttacker;
    return this.giveAttackerAttack();
  }

  giveNextAttackerAttack() {
    this.game.players.attacker = this.#nextAttacker;
    return this.giveAttackerAttack();
  }

  giveAttackerLeftDefend() {
    assert.ok(this.currentMove instanceof TransferMove);
    assert.ok(this.currentMove.player instanceof Attacker);
    assert.ok(this.currentMove.player === this.game.players.attacker);
    assert.ok(this.currentMove.player.left === this.game.players.attacker.left); // TODO remove
    this.game.players.defender = this.currentMove.player.left;
    assert.ok(this.currentMove.player.left === this.game.players.defender); // TODO remove
    return this.giveDefenderDefend();
  }

  makeDefendInsertMove(card: Card, slotIndex: number) {
    return this.#updateCurrentMoveTo(InsertDefendCardMove, { card, slotIndex });
  }

  makeAttackInsertMove(card: Card, slotIndex: number) {
    return this.#updateCurrentMoveTo(InsertAttackCardMove, { card, slotIndex });
  }

  makeTransferMove(card: Card, slotIndex: number) {
    return this.#updateCurrentMoveTo(TransferMove, { card, slotIndex });
  }

  makeAttackStopMove() {
    return this.#updateCurrentMoveTo(StopAttackMove);
  }

  makeDefendStopMove() {
    return this.#updateCurrentMoveTo(StopDefenseMove);
  }

  makeDefenderLost() {
    return this.#updateCurrentMoveTo(DefenderGaveUpMove);
  }

  #updateCurrentMoveTo<M extends (DefenderMove | AttackerMove) & AfterHandler>(
    CertainMove: new (arg: any) => M & AfterHandler,
    certainMoveContext?: Partial<M>,
  ) {
    clearTimeout(this.currentMove.defaultBehaviour);
    this.#currentMove = new CertainMove({
      game: this.game,
      player: certainMoveContext?.player || this.currentMove.player,
      ...certainMoveContext,
    });
    assert.ok(
      this.currentMove instanceof CertainMove,
      "Current move was not correctly updated",
    );
    return this.currentMove.handleAfterMoveIsDone();
  }
}

export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export function insertCardStrategy(
  this: InsertDefendCardMove | InsertAttackCardMove | TransferMove,
) {
  assert.ok(this.player instanceof Attacker || this.player instanceof Defender);
  return this.game.desk.receiveCard({
    card: this.card,
    index: this.slotIndex,
    who: this.player,
  });
}
