import type { GameState } from "@durak-game/durak-dts";
import type DurakGame from "../DurakGame.js";
import type { BasePlayer } from "../entity/Player/BasePlayer.abstract.js";

export default class DurakGameStateDto {
  self: GameState["self"];
  enemies: GameState["enemies"];
  settings: GameState['settings'];
  desk: GameState['desk'];
  talon: GameState['talon'];
  discard: GameState['discard'];
  round: GameState['round'];
  status: GameState['status'];

  // NOTE: even if game.status === 'ended'
  // all properties above should be correctly added
  // no errors should be received while this object is being created
  constructor(game: DurakGame, playerId: BasePlayer["id"]) {
    const currentPlayer = game.players.get((player) => player.id === playerId);
    this.self = currentPlayer.toSelf();
    this.enemies = currentPlayer.enemies;
    this.settings = game.settings;
    this.status = game.info.status;
    this.desk = game.desk.toJSON();
    this.talon = game.talon.toJSON();
    this.discard = game.discard.toJSON();
    this.round = game.round.toJSON();
  }
}
