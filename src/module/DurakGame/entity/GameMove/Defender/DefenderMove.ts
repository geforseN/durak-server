import GameMove from "../GameMove.abstract";
import type Defender from "../../Player/Defender";
import type DurakGame from "../../../DurakGame.implimetntation";
import type Card from "../../Card";
import { Player, SuperPlayer } from "../../Player";
import { DefenderMoveDefaultBehavior } from "./DefenderMoveDefaultBehavior";

export default class DefenderMove extends GameMove {
  performer: Defender;
  defaultBehavior: DefenderMoveDefaultBehavior;

  constructor(game: DurakGame, movePerformer: Player = game.players.defender) {
    super(game);
    this.game.players.defender = movePerformer;
    this.performer = this.game.players.defender;
    this.defaultBehavior = new DefenderMoveDefaultBehavior(this);
  }

  async allowsTransferMove(card: Card, slotIndex: number) {
    return (
      this.player.left.canTakeMore(this.game.desk.cardsCount) &&
      this.game.desk.allowsTransferMove(card, slotIndex)
    );
  }
}
