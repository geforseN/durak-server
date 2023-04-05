import assert from "node:assert";
import Desk from "./Desk";
import { Attacker, Defender, Player } from "./Players";
import { AttackerMove, DefenderMove, GameMove, InsertDefendCardMove, StopDefenseMove } from "./GameMove";
import { GameService } from "../../namespaces/games/game.service";

type GameRoundConstructorArgs = { attacker: Attacker, number: number, desk: Desk, service: GameService };

export default class GameRound {
  private readonly number: number;
  private readonly moves: GameMove[];
  private readonly desk: Desk;
  private readonly service: GameService;

  constructor({ number, desk, attacker: player, service }: GameRoundConstructorArgs) {
    this.number = number;
    this.desk = desk;
    this.moves = [];
    this.service = service;
    this.pushNextMove(AttackerMove, ({ player, deskCardCount: desk.cardCount }));
  }

  get currentMoveIndex(): number {
    return this.moves.length - 1;
  }

  get hasOneMove() {
    return this.moves.length === 1;
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

  currentMoveAllowedTo(player: Player): boolean {
    return this.currentMove.player.id === player.id;
  }

  get isDefenderGaveUp() {
    return this.moves.some((move) => move instanceof StopDefenseMove);
  }

  get defenderGaveUpAtPreviousMove(): boolean {
    return this.previousMove instanceof StopDefenseMove;
  }

  get lastSuccesfullDefense(): DefenderMove | undefined {
    for (let i = this.moves.length - 1; i > 0; i--) {
      const [currentMove, previousMove] = [this.moves[i], this.moves[i - 1]];
      if (previousMove instanceof InsertDefendCardMove
        && currentMove instanceof AttackerMove
      ) return previousMove;
    }
  }

  pushNextMove<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    moveConstructorArg: Partial<InstanceType<{ new(arg: any): M }>> & { allowedPlayer: Player },
  ) {
    const { currentMove: { number }, desk: { cardCount: deskCardCount } } = this;
    const { allowedPlayer } = moveConstructorArg;
    this.service.setSuperPlayerUI("revealed", allowedPlayer as Defender | Attacker);
    this.service.letMoveTo(allowedPlayer.info.accname);
    this.moves.push(new MoveConstructor({ number: number + 1, deskCardCount, ...moveConstructorArg }));
  }

  updateCurrentMoveTo<M extends GameMove>(
    MoveConstructor: { new(arg: any): M },
    moveConstructorArg: Partial<InstanceType<{ new(arg: any): M }>>,
  ) {
    const { currentMove: { number, allowedPlayer }, desk: { cardCount: deskCardCount } } = this;
    this.currentMove = new MoveConstructor({ allowedPlayer, number, deskCardCount, ...moveConstructorArg });
  }

  get firstDefenderMove(): DefenderMove {
    const defenderMove = this.moves.find((move) => move instanceof InsertDefendCardMove);
    assert.ok(defenderMove, "Нет защищающегося хода");
    return defenderMove;
  }

  get primalAttacker(): Attacker {
    return this.firstDefenderMove.player.right as Attacker;
  }

  get distributionQueue() {
    const playersQueue: Player[] = [this.primalAttacker];
    const defender = this.primalAttacker.left;
    let player = defender.left;
    while (player.left.id !== defender.id) {
      playersQueue.push(player);
      player = player.left;
    }
    playersQueue.push(defender);
    return playersQueue;
  }

    return playersQueue.concat(defender);
  }
}
