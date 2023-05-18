import Card from "../entity/Card";
import { DeskSlot } from "./index";

export default class EmptySlot extends DeskSlot {
  constructor() {
    super();
  }

  get value(): [] {
    return [];
  }

  override ensureCanBeAttacked({ card }: { card: Card }) {
    return Promise.resolve(card);
  }

  override ensureCanBeDefended({ card: _card }: { card: Card }) {
    return Promise.reject(new Error("Нет от чего защищаться"));
  }

  override ensureAllowsTransfer({ card }: { card: Card }) {
    return Promise.resolve(card);
  }
}