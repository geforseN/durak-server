import type { DefendedSlot, DeskSlot, UnbeatenSlot } from "@/module/DurakGame/entity/DeskSlot/index.js";

export abstract class Slots<S> {
  constructor(protected value: S[]) { }

  get count() {
    return this.value.length;
  }
}

export class UnbeatenSlots extends Slots<UnbeatenSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(allSlots.filter((slot): slot is UnbeatenSlot => slot.isUnbeaten()));
  }

  get cardCount() {
    return this.count;
  }

  get cards() {
    return this.value.map((slot) => slot.attackCard);
  }
}

export class FilledSlots extends Slots<UnbeatenSlot | DefendedSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(
      allSlots.filter(
        (slot): slot is UnbeatenSlot | DefendedSlot =>
          slot.isUnbeaten() || slot.isDefended(),
      ),
    );
  }
}

export class DefendedSlots extends Slots<DefendedSlot> {
  constructor(allSlots: DeskSlot[]) {
    super(allSlots.filter((slot): slot is DefendedSlot => slot.isDefended()));
  }
}
