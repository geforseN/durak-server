import Player from "./entity/Players/Player";
import Attacker from "./entity/Players/Attacker";
import Defender from "./entity/Players/Defender";
import { LobbyUserIdentifier } from "../namespaces/lobbies/entity/lobby-users";

type DefenderObject = { defender: Defender };
type AttackerObject = { attacker: Attacker };

export default class GameRound {
  allowedToMovePlayerAccname: string;
  originalAttackerAccname: string;
  originalDefenderAccname: string;
  number: number;
  distributionAccnameQueue: string[];
  lastCardCount: number | null;

  constructor({ attacker, defender }: AttackerObject & DefenderObject) {
    this.number = 1;
    this.allowedToMovePlayerAccname = attacker.info.accname;
    this.lastCardCount = null;
    this.originalAttackerAccname = attacker.info.accname;
    this.originalDefenderAccname = defender.info.accname;
    this.distributionAccnameQueue = [];
  }

  canMakeMove(player: Player): boolean {
    return player.info.accname === this.allowedToMovePlayerAccname;
  }

  nextRound({ attacker, defender }: AttackerObject & DefenderObject): void {
    this.number++;
    this.originalDefenderAccname = defender.info.accname;
    this.originalAttackerAccname = attacker.info.accname;
    this.setDistributionQueue({ defender, attacker });
  }

  letMoveToInitialAttacker({ cardCount }: { cardCount: number }) {
    this.lastCardCount = cardCount;
    this.letMoveTo({ accname: this.originalAttackerAccname });
  }

  letMoveTo({ accname }: LobbyUserIdentifier) {
    this.allowedToMovePlayerAccname = accname;
  }

  private setDistributionQueue({ defender, attacker }: DefenderObject & AttackerObject) {
    this.distributionAccnameQueue = [attacker.info.accname];
    this.pushPlayersInDistributionQueue({ initialPlayer: defender.left });
    this.distributionAccnameQueue.push(defender.info.accname);
  }

  private pushPlayersInDistributionQueue({ initialPlayer }: { initialPlayer: Player }) {
    let player = initialPlayer;
    while (this.notOriginalDefender(player) || this.notOriginalAttacker(player)) {
      this.distributionAccnameQueue.push(player.info.accname);
      player = player.left;
    }
  }

  private notOriginalDefender(player: Player): boolean {
    return player.info.accname !== this.originalDefenderAccname;
  }

  private notOriginalAttacker(player: Player): boolean {
    return player.info.accname !== this.originalAttackerAccname;
  }
}