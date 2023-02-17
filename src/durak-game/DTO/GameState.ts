import Card from "../entity/Card";
import Self from "./Self.dto";
import Enemy from "./Enemy.dto";
import DeskSlot from "../entity/DeskSlot";
import DurakGame from "../durak-game";
import { LobbyUserIdentifier } from "../../namespaces/lobbies/entity/lobby-users";

export default class GameState {
  self: Self;
  enemies: Enemy[];
  deskSlots: DeskSlot[];
  trumpCard: Card;

  constructor(game: DurakGame, accname: LobbyUserIdentifier["accname"]) {
    this.self = new Self(game.players.tryGetPlayer({ accname }));
    this.enemies = game.players.getPlayerEnemies({ accname }).map(((enemy) => new Enemy(enemy)));
    this.deskSlots = game.desk.slots;
    this.trumpCard = game.talon.trumpCard;
  }
}