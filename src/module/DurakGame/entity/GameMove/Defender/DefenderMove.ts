import GameMove from "../GameMove.abstract";
import type Defender from "../../Player/Defender";
import type DurakGame from "../../../DurakGame";
import { Player } from "../../Player";
import { DefenderMoveDefaultBehavior } from "./DefenderMoveDefaultBehavior";

export default class DefenderMove extends GameMove {
  performer: Defender;
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(
    game: DurakGame,
    { performer = game.players.defender }: { performer: Player },
  ) {
    super(game);
    this.game.players.defender = performer;
    this.performer = this.game.players.defender;
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }
}
