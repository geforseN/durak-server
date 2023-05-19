import DurakGame from "../../DurakGame.implimetntation";
import { InsertAttackCardMove } from "../GameMove";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  hasPutLastCard({ round }: { round: DurakGame["round"] }): boolean {
    return (
      round.previousMove instanceof InsertAttackCardMove
      && round.previousMove.player.id === this.id
    );
  }
}
