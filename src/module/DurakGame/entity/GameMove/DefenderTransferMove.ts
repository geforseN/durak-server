import type DurakGame from "../../DurakGame";
import type Card from "../Card";
import GameMove, {
  type CardInsert,
  type AfterHandler,
} from "./GameMove.abstract";
import type AllowedToMoveDefender from "../Player/AllowedToMoveDefender";
import { DefenderMoveDefaultBehavior } from "./DefaultBehavior/DefenderMoveDefaultBehavior";

export default class TransferMove
  extends GameMove<AllowedToMoveDefender>
  implements AfterHandler, CardInsert
{
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(
    game: DurakGame,
    performer: AllowedToMoveDefender,
    context: {
      card: Card;
      slotIndex: number;
    },
  ) {
    super(game, performer);
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  override isBaseMove(): boolean {
    return false;
  }

  override isInsertMove() {
    return true;
  }

  // TODO: fix hard to catch bug in this.#defaultBehavior
  // should be this.#defaultBehavior redefined
  // when this.player become Attacker (code line below)
  // or should just clearInterval(this.defaultBehavior)
  handleAfterMoveIsDone() {
    this.game.players.setPlayer(this.game.players.attacker);
    // NOTE: line above made players without attacker
    // after line above only defender exist
    this.game.players.setAttacker(
      this.performer.asAttacker().asAllowedToMakeMove(this.game),
    );
    this.game.players.setDefender(this.game.players.attacker.left.asDefender());
  }
}
