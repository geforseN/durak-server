import type DurakGame from "../../DurakGame";
import type Player from "../Player/Player";
import type DefaultBehavior from "./DefaultBehavior/DefaultBehavior";

// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO
// TODO maybe call it calculateNewMove
// method should return base move or ... idk
export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export interface CardInsert {}

export default abstract class GameMove<Performer extends Player> {
  game: DurakGame;
  performer: Performer;
  abstract defaultBehavior: DefaultBehavior<Performer>;

  protected constructor(game: DurakGame, performer: Performer) {
    this.game = game;
    this.performer = performer;
  }

  abstract isBaseMove(): boolean;
  abstract isInsertMove(): this is CardInsert;
  isNotBase(): this is AfterHandler {
    return !this.isBaseMove();
  }

  get latestPerformer() {
    return this.game.players.get((player) => player.id === this.performer.id);
  }

  emitContextToPlayers() {
    // TODO
    // TODO
    // TODO emit without allowedPlayerId data
    this.game.info.namespace.to(this.latestPerformer.id).emit();
    // TODO above
    this.game.info.namespace.emit("move::new", {
      move: {
        allowedPlayer: { id: this.latestPerformer.id },
        name: this.constructor.name,
        endTime: { UTC: this.defaultBehavior.callTime.UTC },
        timeToMove: this.game.settings.moveTime,
      },
    });
  }
}
