import { Defender } from "./Defender.js";

export class SurrenderedDefender extends Defender {
  constructor(defender: Defender) {
    super(defender);
  }

  isSurrendered() {
    return true;
  }

  // @ts-ignore
  get kind() {
    return "SurrenderedDefender" as const;
  }
}
