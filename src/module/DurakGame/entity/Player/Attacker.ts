import { InsertAttackCardMove } from "../GameMove";
import GameRound from "../GameRound";
import SuperPlayer from "./SuperPlayer";

export default class Attacker extends SuperPlayer {
  hasPutLastCard(round: GameRound): boolean {
    return (
      round.previousMove instanceof InsertAttackCardMove &&
      round.previousMove.player.id === this.id
    );
  }
}
