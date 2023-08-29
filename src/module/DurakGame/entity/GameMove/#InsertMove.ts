import Card from "../Card";
import Desk from "../Desk";

export default class InsertMove {
  card;
  slotIndex;
  desk;

  constructor(card: Card, slotIndex: number, desk: Desk) {
    this.card = card;
    // NOTE - or use slot: DeskSlot
    this.slotIndex = slotIndex;
    this.desk = desk;
  }
}
