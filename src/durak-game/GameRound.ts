import Player from "./entity/Players/Player";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";
import Card from "./entity/Card";

type DefendMoveStatus = "DEFENDED" | "LOST" | "TRANSFER";
type AttackMoveStatus = "INSERT" | "SKIP";

type GameMoveArgs<P extends Player> = { number: number, allowedPlayer: P }

export class GameMove {
  number: number;
  allowedPlayer: Player;

  constructor({ number, allowedPlayer }: GameMoveArgs<Player>) {
    this.number = number;
    this.allowedPlayer = allowedPlayer;
  }

  get allowedPlayerAccname() {
    return this.allowedPlayer.info.accname;
  }
}

export class AttackerMove extends GameMove {
  constructor({ number, allowedPlayer }: GameMoveArgs<Attacker>) {
    super({ number, allowedPlayer });
  }
}

export class DefenderMove extends GameMove {
  deskCardCount: number;

  constructor({ number, allowedPlayer, deskCardCount }: GameMoveArgs<Defender> & { deskCardCount: number }) {
    super({ number, allowedPlayer });
    this.deskCardCount = deskCardCount;
  }
}

export class TransferMove extends DefenderMove {
  card: Card;
  slotIndex: number;
  from?: Player;
  to?: Player;

  constructor({
                card,
                deskIndex,
                ...superProps
              }: GameMoveArgs<Defender> & { card: Card, deskIndex: number, deskCardCount: number }) {
    super(superProps);
    this.card = card;
    this.slotIndex = deskIndex;
  }
}

export class StopAttackMove extends AttackerMove {
  deskCardCount: number;

  constructor({ number, allowedPlayer, deskCardCount }: GameMoveArgs<Attacker> & { deskCardCount: number }) {
    super({ number, allowedPlayer });
    this.deskCardCount = deskCardCount;
  }
}

export class InsertAttackCardMove extends AttackerMove {
  card: Card;
  slotIndex: number;

  constructor({ slotIndex, card, number, allowedPlayer }: { slotIndex: number, card: Card } & GameMoveArgs<Attacker>) {
    super({ number, allowedPlayer });
    this.slotIndex = slotIndex;
    this.card = card;
  }
}

export class InsertDefendCardMove extends DefenderMove {
}

export class StopDefenseMove extends DefenderMove {
}

export default class GameRound {
  number: number;
  moves: GameMove[];
  principalAttacker: Attacker | Player | null;

  constructor({ attacker, number }: { attacker: Attacker, number: number }) {
    this.number = number;
    this.moves = [new AttackerMove({ number: 1, allowedPlayer: attacker })];
    this.principalAttacker = null;
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
}

type Construct<O> = { new(...args: any): O }