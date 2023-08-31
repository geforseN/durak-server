import DurakGame, { type CanReceiveCards } from "../../DurakGame";
import SuperPlayer from "./SuperPlayer";
import GameRound from "../GameRound";
import type Player from "./Player";
import AllowedToMoveDefender from "./AllowedToMoveDefender";

export default class Defender extends SuperPlayer implements CanReceiveCards {
  readonly isSurrendered: boolean;

  constructor(player: Player, isSurrendered = false) {
    super(player);
    this.isSurrendered = isSurrendered;
  }

  override get kind() {
    return "Defender" as const;
  }

  override isDefender() {
    return true;
  }

  asSurrenderedDefender() {
    return new Defender(this, true);
  }

  asAllowedToMakeMove(game: DurakGame) {
    return new AllowedToMoveDefender(this, game);
  }

  // TODO add ensureCanDefend(unbeatenDeskCards)
  // TODO add ensureCanMakeTransferMove(desk)

  canDefend(cardCount: number) {
    return this.canTakeMore(cardCount);
  }

  canWinDefense(round: GameRound) {
    try {
      return (
        //  below statement is for 2 players game:
        //  in 2 players game can be only one attacker
        //  IF attacker stop move THAN defender won
        this.left === round.primalAttacker ||
        // below statement is for more than 2 players game
        round.game.players.attacker.left === round.primalAttacker
      );
    } catch (error) {
      // TODO if (error instanceof NoPrimalAttackerError) {}
      // TODO else throw error
      return false;
    }
  }
}
