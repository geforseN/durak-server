import Player from "./entity/Players/Player";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";

type DefenderObject = { defender: Defender };
type AttackerObject = { attacker: Attacker };

export default class GameRound {
  __allowedToMovePlayerAccname: string;
  __originalAttackerAccname: string;
  __originalDefender: Defender;
  __originalDefenderAccname: string;
  number: number;
  __distributionAccnameQueue: string[];
  __lastDefenseCardCount: number | null;
  currentMove: {
    number: number,
    allowedPlayer: Player,
    get allowedPlayerAccname(): string
  };
  lastSuccesfullDefense?: {
    cardCount: number | null,
    moveNumber: number | null,
  };
  firstMove: {
    attacker: Attacker,
    defender: Defender,
    get attackerAccname(): string,
    get defenderAccname(): string,
  };
  distributionQueue: Player[];

  constructor(round: number, { attacker, defender }: AttackerObject & DefenderObject) {
    this.number = round;
    this.__allowedToMovePlayerAccname = attacker.info.accname;
    this.__lastDefenseCardCount = null; //
    this.__originalDefender = defender;
    this.__originalAttackerAccname = attacker.info.accname;
    this.__originalDefenderAccname = defender.info.accname;
    this.__distributionAccnameQueue = []; //
    this.currentMove = {
      number: 1,
      allowedPlayer: attacker,
      allowedPlayerAccname: attacker.info.accname,
    };
    this.firstMove = {
      defender,
      attacker,
      defenderAccname: defender.info.accname,
      attackerAccname: attacker.info.accname,
    };
    this.distributionQueue = [];
  }

  __canMakeMove(player: Player): boolean {
    return player.info.accname === this.__allowedToMovePlayerAccname;
  }

  canMakeMove({ info: { accname } }: Player): boolean {
    return this.currentMove.allowedPlayerAccname === accname;
  }

  __next________________({ attacker, defender }: AttackerObject & DefenderObject): void {
    this.number++;
    this.__originalDefenderAccname = defender.info.accname;
    this.__originalAttackerAccname = attacker.info.accname;
    this.__setDistributionQueue({ defender, attacker });
  }

  nextCurrentMove(
    { allowedPlayer }: { allowedPlayer: Player },
  ): void {
    this.currentMove.number++;
    this.currentMove.allowedPlayer = allowedPlayer;
  }

  next(
    { attacker, defender, allowedPlayer }: AttackerObject & DefenderObject & { allowedPlayer: Player },
  ): void {
    this.currentMove.number++;
    this.currentMove.allowedPlayer = allowedPlayer;
    this.currentMove.allowedPlayerAccname = allowedPlayer.info.accname;
    this.firstMoveInit({ defender, attacker });
    this.setDistributionQueue({ defender, attacker });
  }

  __letMoveTo(playerOrAccname: string | Player) {
    this.__allowedToMovePlayerAccname = this.__getAccname(playerOrAccname);
  }

  __letMoveToOriginalAttacker() {
    this.__allowedToMovePlayerAccname = this.__originalAttackerAccname;
  }

  __letMoveToDefender() {
    this.__allowedToMovePlayerAccname = this.__originalDefenderAccname;
  }

  private __setDistributionQueue({ defender, attacker }: DefenderObject & AttackerObject) {
    this.__distributionAccnameQueue = [attacker.info.accname];
    this.__pushPlayersInDistributionQueue({ initialPlayer: defender.left });
    this.__distributionAccnameQueue.push(defender.info.accname);
  }

  private setDistributionQueue({ defender, attacker }: DefenderObject & AttackerObject) {
    this.distributionQueue = [attacker];
    this.pushPlayersInDistributionQueue({ initialPlayer: defender.left });
    this.distributionQueue.push(defender);
  }

  private __pushPlayersInDistributionQueue({ initialPlayer }: { initialPlayer: Player }) {
    let player = initialPlayer;
    while (this.__notOriginalDefender(player) || this.__notOriginalAttacker(player)) {
      this.__distributionAccnameQueue.push(player.info.accname);
      player = player.left;
    }
  }

  private pushPlayersInDistributionQueue({ initialPlayer }: { initialPlayer: Player }) {
    let player = initialPlayer;
    while (!this.isOriginalDefender(player) || !this.isOriginalAttacker(player)) {
      this.distributionQueue.push(player);
      player = player.left;
    }
  }

  __isOriginalAttacker(player: Player): boolean {
    return player.info.accname === this.__originalAttackerAccname;
  }

  isOriginalAttacker(player: Player): boolean {
    return player.info.accname === this.firstMove.attackerAccname;
  }

  private __notOriginalDefender(player: Player): boolean {
    return player.info.accname !== this.__originalDefenderAccname;
  }

  private __notOriginalAttacker(player: Player): boolean {
    return player.info.accname !== this.__originalAttackerAccname;
  }

  private isOriginalDefender(player: Player) {
    return player.info.accname === this.firstMove.defenderAccname;
  }

  private __getAccname(playerOrAccname: Player | string): string {
    return playerOrAccname instanceof Player ? playerOrAccname.info.accname : playerOrAccname;
  }

  private firstMoveInit({ attacker, defender }: { attacker: Attacker; defender: Defender }) {
    this.firstMove.defenderAccname = defender.info.accname;
    this.firstMove.defender = defender;
    this.firstMove.attackerAccname = attacker.info.accname;
    this.firstMove.attacker = attacker;
  }
}