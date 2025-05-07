import type Hand from "@/module/DurakGame/entity/Deck/Hand/index.js";

export class MaybeLinkedPlayer {
  _left: MaybeLinkedPlayer | null = null;
  _right: MaybeLinkedPlayer | null = null;

  constructor(
    readonly id: string,
    readonly hand: Hand,
  ) {}
}
