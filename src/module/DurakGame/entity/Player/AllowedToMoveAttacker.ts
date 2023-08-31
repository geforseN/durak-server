import Attacker from "./Attacker";
import {
  BaseAttackerMove,
  InsertAttackCardMove,
  StopAttackMove,
} from "../GameMove";
import { CardDTO } from "../../DTO";
import { CanMakeMove } from "./Player";
import DurakGame from "../../DurakGame";

export default class AllowedToMoveAttacker extends Attacker implements CanMakeMove {
  game;

  stopAttack = undefined;
  attackSlot = undefined;

  __defaultBehavior__ = undefined;

  constructor(player: Attacker, game: DurakGame) {
    super(player);
    this.game = game;
  }

  makeBaseMove(): BaseAttackerMove {
    return new BaseAttackerMove(this.game, this);
  }

  override isAllowedToMove(): this is CanMakeMove {
    return true;
  }

  makeStopMove() {
    return new StopAttackMove(this.game, this);
  }

  async makeInsertMove({ rank, suit }: CardDTO, slotIndex: number) {
    const card = this.hand.get((card) => card.hasSame({ rank, suit }));
    await this.game.desk.ensureCanAttack(card, slotIndex);
    return new InsertAttackCardMove(this.game, this, { card, slotIndex });
  }
}
