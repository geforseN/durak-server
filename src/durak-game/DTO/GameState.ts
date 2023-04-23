import DurakGame from "../DurakGame";
import Card from "../entity/Card";
import Self from "./Self.dto";
import Enemy from "./Enemy.dto";
import { DeskSlot } from "../entity/DeskSlot";

export default class GameState {
  self: Self;
  enemies: Enemy[];
  deskSlots: DeskSlot[];
  trumpCard: Card;
  allowedPlayerAccname: string;

  constructor(game: DurakGame, playerId: string) {
    const id = playerId;
    this.self = new Self(game.players.getPlayer({ id }));
    this.enemies = game.players.manager.getPlayerEnemies({ id }).map(((enemy) => new Enemy(enemy)));
    this.deskSlots = game.desk.slots;
    this.trumpCard = game.talon.trumpCard;
    this.allowedPlayerAccname = game.round.currentMove.player.id;
  }
}