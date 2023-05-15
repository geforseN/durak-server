import Attacker from "../Players/Attacker";
import { GameMove } from "./GameMove";
import { randomInt } from "node:crypto";

export class AttackerMove extends GameMove<Attacker> {
  // DO NOT FORGET TO CLEAR TIMEOUT WHEN
  // - pushNextMove
  // - updateNextMove
  // - user handler
  // TODO: add handlers for other moves
  // NOTE: below code for first attacker move
  get defaultBehaviour() {
    return setTimeout(() => {
      if (this.attackerShouldStopAttack) {
        return this.player.stopMove({ game: this.game });
      }
      this.insertRandomCard();
    }, this.game.settings.moveTime);
  }

  private get attackerShouldStopAttack(): boolean {
    if (this.game.desk.isEmpty) return false;
    const { ranks } = this.game.desk;
    const { value: cards } = this.player.hand;
    return cards.every(({ rank }) => !ranks.includes(rank));
  }

  private insertRandomCard() {
    const cardIndex = this.player.randomCardIndex;
    const card = this.player.hand.value[cardIndex];
    this.player.remove({ card });
    // TODO game.desk.randomEmptySlotIndex, randomDefendedSlotIndex, etc...
    //  in inherited classes
    const index = randomInt(0, this.game.desk.slots.length);
    this.game.desk.receiveCard({ card, index, who: this.player });
    // this.game.round.updateCurrentMoveTo(InsertAttackCardMove, {player: this})
  }
}