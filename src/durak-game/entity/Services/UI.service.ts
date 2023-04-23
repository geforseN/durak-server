import { GamesIO, UIStatus } from "../../../namespaces/games/games.types";
import { SuperPlayer, Attacker, Defender } from "../Players";

export default class UIService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  setSuperPlayerUI(status: UIStatus, allowedPlayer: SuperPlayer) {
    if (allowedPlayer instanceof Defender) {
      this.setDefendUI(status, allowedPlayer);
    } else if (allowedPlayer instanceof Attacker) {
      this.setAttackUI(status, allowedPlayer);
    } else throw new Error("New UI is not allowed");
  }

  setDefendUI(status: UIStatus, defender: Defender) {
    this.namespace.to(defender.id).emit("defendUI__setStatus", status);
  }

  setAttackUI(status: UIStatus, attacker: Attacker) {
    this.namespace.to(attacker.id).emit("attackUI__setStatus", status);
  }
}