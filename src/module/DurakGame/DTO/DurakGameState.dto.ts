import DurakGame from "../DurakGame.implimetntation";
import SelfDTO from "./Self.dto";
import EnemyDTO from "./Enemy.dto";
import { OrderedPlayerEnemies } from "../entity/Player/Players";
import { DeskSlot } from "../entity/DeskSlot";

export default class DurakGameStateDto {
  self: SelfDTO;
  enemies: EnemyDTO[];
  deskSlots: DeskSlot[];
  trumpCard: DurakGame["talon"]["trumpCard"];
  allowedPlayerId: string;
  isDiscardEmpty: boolean;
  isTalonEmpty: boolean;
  isTalonHasOneCard: boolean;
  isDefenderGaveUp: boolean;
  playersCount: number;
  roundNumber: number;
  settings: DurakGame["settings"];

  constructor(game: DurakGame, playerId: string) {
    const currentPlayer = game.players.get(
      (player) => player.id === playerId,
    );
    this.self = new SelfDTO(currentPlayer);
    this.enemies = new OrderedPlayerEnemies(currentPlayer).value.map(
      (enemy) => new EnemyDTO(enemy),
    );
    this.deskSlots = [...game.desk];
    this.trumpCard = game.talon.trumpCard;
    this.allowedPlayerId = game.round.currentMove.player.id;
    this.isDiscardEmpty = game.discard.count === 0;
    this.isTalonEmpty = game.talon.isEmpty;
    this.isTalonHasOneCard = game.talon.count === 1;
    this.playersCount = game.settings.userCount;
    this.roundNumber = game.round.number;
    this.isDefenderGaveUp = game.round.isDefenderGaveUp;
    this.settings = game.settings;
  }
}
