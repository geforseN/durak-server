import Card from "@/module/DurakGame/entity/Card/index.js";

export default class TrumpCard extends Card {
  static from(card: Card) {
    return new TrumpCard(card.rank, card.suit);
  }
}
