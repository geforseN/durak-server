import type DurakGame from "../../DurakGame";
import AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { DefenderMoveDefaultBehavior } from "./DefaultBehavior/DefenderMoveDefaultBehavior";
import GameMove from "./GameMove.abstract";

export default class BaseDefenderMove extends GameMove<AllowedToMoveDefender> {
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(game: DurakGame, performer: AllowedToMoveDefender) {
    super(game, performer);
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return true;
  }

  override isInsertMove(): boolean {
    return false;
  }
}
