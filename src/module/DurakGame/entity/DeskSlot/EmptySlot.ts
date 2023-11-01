import Card from "../Card";
import { DeskSlot } from "./index";

export default class EmptySlot extends DeskSlot {
  constructor() {
    super();
  }

  get value(): [] {
    return [];
  }

  override async ensureCanBeAttacked(card: Card) {
    return Promise.resolve(card);
  }

  override ensureCanBeDefended() {
    return Promise.reject(new Error("Нет от чего защищаться"));
  }

  override ensureAllowsTransfer(card: Card) {
    return Promise.resolve(card);
  }
}
