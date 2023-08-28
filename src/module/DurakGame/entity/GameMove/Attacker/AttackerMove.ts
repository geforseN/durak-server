import GameMove from "../GameMove.abstract";
import Attacker from "../../Player/Attacker";
import type DurakGame from "../../../DurakGame";
import { type Player } from "../../Player";
import { AttackerMoveDefaultBehavior } from "./AttackerMoveDefaultBehavior";

export class AttackerMove extends GameMove {
  readonly performer: Attacker;
  readonly defaultBehavior: AttackerMoveDefaultBehavior;

  constructor(
    game: DurakGame,
    { performer = game.players.attacker }: { performer?: Player } = {},
  ) {
    super(game);
    this.game.players.attacker = performer;
    this.performer = this.game.players.attacker;
    this.defaultBehavior = new AttackerMoveDefaultBehavior(this);
  }
}
export default AttackerMove;
