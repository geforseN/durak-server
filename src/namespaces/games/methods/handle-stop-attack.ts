import DurakGame from "../../../durak-game/durak-game";
import { GameSocket } from "../games.service";

export default function handleStopAttack(
  this: { game: DurakGame, accname: string } & GameSocket
) {
  const { game, accname } = this;
  let player = game.players.tryGetPlayer({ accname });
  if (!game.players.isDefender(player)) throw new Error("Вы не защищаетесь");

  if (game.desk.isFull) {
    // SUCCESSFULLY DEFENDED
    // PUSH DESK TO DISCARD
    // GO NEXT TURN
  }
  if (game.desk.isNonEmptySlotsDefended) {
    // LET ATTACKER TRY ATTACK AGAIN
  }
  // ELSE DEFENDER CAN'T DEFEND
  // PUSH DESK CARDS TO DEFENDER
  // CLEAR DESK
  // PUSH TALON CARDS TO ATTACKERS
  // GO NEXT TURN
}