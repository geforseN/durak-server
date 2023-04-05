import Card from "../Card";
import { DeskSlot } from "./index";

export default class EmptySlot extends DeskSlot {
  constructor() {
    super();
  }

  get value(): [] {
    return [];
  }

  assertAttack({ card }: { card: Card }) {
    return Promise.resolve(card);
  }

  assertDefense({ card: _card }: { card: Card }) {
    return Promise.reject("Нет от чего защищаться");
  }

  allowsTransfer({ card }: { card: Card }) {
    return Promise.resolve(card);
  }
}