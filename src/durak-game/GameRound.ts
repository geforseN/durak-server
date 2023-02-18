import Player from "./entity/Players/Player";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";

type DefenderObject = { defender: Defender };
type AttackerObject = { attacker: Attacker };

export class CurrentMove {
  number: number;
  allowedPlayer: Player;

  constructor({ moveNumber, allowedPlayer }: { moveNumber: number, allowedPlayer: Player }) {
    this.number = moveNumber;
    this.allowedPlayer = allowedPlayer;
  }

  get allowedPlayerAccname() {
    return this.allowedPlayer.info.accname;
  }
}

export class FirstMove {
  attacker: Attacker;
  defender: Defender;

  constructor({ attacker, defender }: { attacker: Attacker, defender: Defender }) {
    this.attacker = attacker;
    this.defender = defender;
  }

  get attackerAccname(): string {
    return this.attacker.info.accname;
  }

  get defenderAccname(): string {
    return this.defender.info.accname;
  }
}

export class SuccesfullDefenseMove {
  cardCount: number;
  moveNumber: number;

  constructor({ moveNumber, cardCount }: { cardCount: number, moveNumber: number }) {
    this.cardCount = cardCount;
    this.moveNumber = moveNumber;
  }
}

export class DistributionQueue {
  value: Player[];

  constructor({ attacker, defender }: { attacker: Attacker, defender: Defender }) {
    this.value = [attacker];
    for (let player = defender.left; player !== attacker; player = player.left) {
      this.value.push(player);
    }
    this.value.push(defender);
  }
}

export default class GameRound {
  number: number;
  currentMove: CurrentMove;
  lastSuccesfullDefense?: SuccesfullDefenseMove;
  firstMove: FirstMove;
  distributionQueue: DistributionQueue;

  constructor(roundNumber: number, { attacker, defender }: AttackerObject & DefenderObject) {
    this.number = roundNumber;
    this.currentMove = new CurrentMove({ moveNumber: 1, allowedPlayer: attacker });
    this.firstMove = new FirstMove({ attacker, defender });
    this.distributionQueue = new DistributionQueue({ attacker, defender });
  }

  // get distributionQueue(): Player[] {
  //   const players: Player[] = [this.firstMove.attacker];
  //   const { defender, attacker } = this.firstMove;
  //   for (let player = defender.left; player.info.accname !== attacker.info.accname; player = player.left) {
  //     players.push(player);
  //   }
  //   return players.concat(defender);
  // }

  isOriginalAttacker({ info: { accname } }: Attacker): boolean {
    return this.firstMove.attackerAccname === accname;
  }
}