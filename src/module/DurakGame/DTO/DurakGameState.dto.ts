import type DurakGame from "../DurakGame";
import SelfDTO from "./Self.dto";
import EnemyDTO from "./Enemy.dto";
import OrderedPlayerEnemies from "../entity/Players/OrderedPlayerEnemies";
import type { Player } from "../entity/__Player";
import { isPlayerKind } from "@durak-game/durak-dts";
import assert from "node:assert";

export default class DurakGameStateDto {
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
    assert.ok(isPlayerKind(game.round.currentMove.constructor.name));
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
