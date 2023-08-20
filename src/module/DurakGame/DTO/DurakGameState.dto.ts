import type DurakGame from "../DurakGame";
import SelfDTO from "./Self.dto";
import EnemyDTO from "./Enemy.dto";
import OrderedPlayerEnemies from "../entity/Player/OrderedPlayerEnemies";
import { type DeskSlot } from "../entity/DeskSlot";
import { isPlayerKind, type Player } from "../entity/Player";

export default class DurakGameStateDto {
  self: SelfDTO;
  enemies: EnemyDTO[];
  deskSlots: DeskSlot[];
  trumpCard: DurakGame["talon"]["trumpCard"];
  allowedPlayerId: string;
  roundNumber: number;
  isDefenderGaveUp: boolean;
  isDiscardEmpty: boolean;
  isTalonEmpty: boolean;
  isTalonHasOneCard: boolean;
  settings: DurakGame["settings"];

  constructor(game: DurakGame, playerId: string) {
    const currentPlayer = game.players.get((player) => player.id === playerId);
    this.self = new SelfDTO(currentPlayer);
    this.enemies = new OrderedPlayerEnemies(currentPlayer).value.map(
      (enemy) => new EnemyDTO(enemy),
    );
    this.deskSlots = [...game.desk];
    this.trumpCard = game.talon.trumpCard;
    this.allowedPlayerId = game.round.currentMove.player.id;
    this.roundNumber = game.round.number;
    this.isDefenderGaveUp = game.round.moves.isDefenderGaveUp;
    this.isDiscardEmpty = game.discard.isEmpty;
    this.isTalonEmpty = game.talon.isEmpty;
    this.isTalonHasOneCard = game.talon.hasOneCard;
    this.settings = game.settings;
  }
}

export class BetterDurakGameState {
  self;
  enemies;
  settings;
  desk;
  talon;
  discard;
  round;
  isGameEnded;

  constructor(game: DurakGame, playerId: Player["id"]) {
    const currentPlayer = game.players.get((player) => player.id === playerId);
    this.self = new SelfDTO(currentPlayer);
    this.enemies = new OrderedPlayerEnemies(currentPlayer).value.map(
      (enemy) => new EnemyDTO(enemy),
    );
    this.settings = game.settings;
    // TODO implement toJSON method in talon, discard, round, ...etc
    this.desk = { slots: [...game.desk] };
    this.talon = {
      trumpCard: game.talon.trumpCard,
      isEmpty: game.talon.isEmpty,
      hasOneCard: game.talon.hasOneCard,
    };
    this.discard = { isEmpty: game.discard.isEmpty };
    isPlayerKind(game.round.currentMove.constructor.name);
    this.round = {
      number: game.round.number,
      currentMove: {
        name: game.round.currentMove.constructor.name,
        allowedPlayer: {
          id: game.round.currentMove.player.id,
        },
        endTime: game.round.currentMove.defaultBehavior.callTime,
      },
    };
    // NOTE: even if (game.isEnded === false)
    // all properties above should be correctly added
    // no errors should be received while this object is being created
    this.isGameEnded = game.isEnded;
  }
}
