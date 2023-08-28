import Card from "../Card";
import Desk from "../Desk";

export interface CardInsert {
  card: Card;
  slotIndex: number;
  desk: Desk;

  insertCardOnDesk(): void;
}
