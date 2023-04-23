import Card from "../Card";
import { DeskSlot } from "./index";

export default class EmptySlot extends DeskSlot {
  constructor() {
    super();
  }

  get value(): [] {
    return [];
  }

  assertCanBeAttacked({ card }: { card: Card }) {
    return Promise.resolve(card);
  }

  assertCanBeDefended({ card: _card }: { card: Card }) {
    return Promise.reject("Нет от чего защищаться");
  }

  allowsTransfer({ card }: { card: Card }) {
    return Promise.resolve(card);
  }
}