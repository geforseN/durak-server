import assert from "node:assert";
import { Player } from "./index";
import Card from "../Card";
import DurakGame from "../../DurakGame";

export default abstract class SuperPlayer extends Player {
  public remove({ card }: { card: Card }): Card {
    const index = this.hand.findIndex({ card });
    assert.notStrictEqual(index, -1, "Неверный индекс");
    const removedCards = this.hand.value.splice(index, 1);
    assert.equal(removedCards.length, 1, "Должна быть одна карта");
    return removedCards[0];
  }

  abstract putCardOnDesk(props: { game: DurakGame, card: Card, index: number }): Promise<void>;

  abstract stopMove(props: { game: DurakGame }): void | never;
};