import GameMove from "./GameMove.abstract";
import type DurakGame from "../../DurakGame";
import { AttackerMoveDefaultBehavior } from "./DefaultBehavior/AttackerMoveDefaultBehavior";
import AllowedToMoveAttacker from "../Player/AllowedToMoveAttacker";

export default class BaseAttackerMove extends GameMove<AllowedToMoveAttacker> {
  readonly defaultBehavior: AttackerMoveDefaultBehavior;

  constructor(game: DurakGame, performer: AllowedToMoveAttacker) {
    super(game, performer);
    this.defaultBehavior = new AttackerMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return true;
  }

  override isInsertMove(): boolean {
    return false;
  }
}
