import { Player, PlayerKind } from "../entity/Player";

export default class SelfDTO {
  cards: Player['hand'];
  info: Player['info'];
  kind: PlayerKind;
  id: string;

  constructor(player: Player) {
    // NOTE: if bug happened here than Hand#toJSON did not work correctly
    this.cards = player.hand;
    this.info = player.info;
    this.kind = player.constructor.name as PlayerKind;
    this.id = player.id;
  }
}
