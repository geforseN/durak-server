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
import DurakGame from "../../DurakGame.implimetntation";
import Card from "../Card";

export default class GameRound {
  readonly number: number;
  private readonly moves: GameMove<Defender | Attacker>[];
  private readonly service?: GameRoundService;
  game: DurakGame;

  constructor({ number, game }: { number: number; game: DurakGame }) {
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
    UncertainMove: { new (arg: any): M },
    moveContext: Required<Pick<M, "player">>,
  ) {
    clearTimeout(this.currentMove?.defaultBehaviour);
    this.moves.push(
      new UncertainMove({
        game: this.game,
        player: moveContext.player,
      }),
    );
    this.service?.letMoveTo(
      moveContext.player,
      this.currentMove.defaultBehaviourCallTimeInUTC,
      this.game.settings.moveTime,
    );
  }

  #updateCurrentMoveTo<M extends GameMove<Attacker | Defender>>(
    CertainMove: { new (arg: any): M },
    moveContext: Partial<M> = {},
  ) {
    clearTimeout(this.currentMove.defaultBehaviour);
    this.currentMove = new CertainMove({
      game: this.game,
      player: moveContext.player ?? this.currentMove.player,
      ...moveContext,
    });
  }

  get #firstDefenderMove(): GameMove<Defender | Attacker> | undefined {
    return this.moves.find(
      (move) =>
        move instanceof InsertDefendCardMove ||
        move instanceof DefenderGaveUpMove,
    );
  }

  get firstDefenderMove(): DefenderMove | never {
    assert.ok(this.#firstDefenderMove, "Нет защищающегося хода");
    assert.ok(
      this.#firstDefenderMove instanceof DefenderMove,
      "Ход не является защищающимся",
    );
    return this.#firstDefenderMove;
  }

  get primalAttacker(): Attacker | never {
    assert.ok(this.firstDefenderMove.player.right instanceof Attacker);
    return this.firstDefenderMove.player.right;
  }

  get nextAttacker(): Player {
    return this.game.players.attacker.isPrimalAttacker({ round: this })
      ? this.game.players.defender.left
      : this.game.players.attacker.left;
  }

  get hasPrimalAttacker(): boolean {
    return !!this.#firstDefenderMove;
  }

  giveDefenderDefend() {
    return this.#pushNextMove(DefenderMove, {
      player: this.game.players.defender,
    });
  }

  giveDefenderLastChance() {
    return this.giveDefenderDefend();
  }

  giveAttackerAttack() {
    return this.#pushNextMove(AttackerMove, {
      player: this.game.players.attacker,
    });
  }

  givePrimalAttackerAttack() {
    return this.game.round.#pushNextMove(AttackerMove, {
      player: this.game.players.manager.makeNewAttacker(
        this.game.round.primalAttacker,
      ),
    });
  }

  giveNextAttackerAttack() {
    return this.#pushNextMove(AttackerMove, {
      player: this.game.players.manager.makeNewAttacker(this.nextAttacker),
    });
  }

  giveAttackerLeftDefend() {
    return this.#pushNextMove(DefenderMove, {
      player: this.game.players.manager.makeDefender(
        this.game.players.attacker.left,
      ),
    });
  }

  makeDefendInsertMove(card: Card, slotIndex: number) {
    return this.#make(InsertDefendCardMove, { card, slotIndex });
  }

  makeAttackInsertMove(card: Card, slotIndex: number) {
    return this.#make(InsertAttackCardMove, { card, slotIndex });
  }

  makeTransferMove(card: Card, slotIndex: number) {
    return this.#make(TransferMove, { card, slotIndex });
  }

  makeAttackStopMove() {
    return this.#make(StopAttackMove);
  }

  makeDefendStopMove() {
    return this.#make(StopDefenseMove);
  }

  makeDefenderLost() {
    return this.#make(DefenderGaveUpMove);
  }

  #make<M extends (DefenderMove | AttackerMove) & AfterHandler>(
    CertainMove: new (arg: any) => M,
    certainMoveContext?: Partial<M>,
  ) {
    this.#updateCurrentMoveTo(CertainMove, certainMoveContext);
    assert.ok(this.currentMove instanceof CertainMove, "(-_-)");
    return this.currentMove.handleAfterInitialization();
  }
}

export interface AfterHandler {
  handleAfterInitialization(): void;
}

export function insertCard(
  this: GameMove<Attacker | Defender> & { card: Card; slotIndex: number },
) {
  return this.game.desk.receiveCard({
    card: this.card,
    index: this.slotIndex,
    who: this.player,
  });
}
