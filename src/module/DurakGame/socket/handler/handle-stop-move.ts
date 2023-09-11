import assert from "node:assert";
import DurakGame from "../../DurakGame.js";
import { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";
import { makeMagic } from "./makeMagic.js";

export default function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  try {
    assert.ok(
      !this.game.desk.isEmpty,
      "Нельзя закончить раунд с пустым столом",
    );
    const player = this.game.players.get<AllowedSuperPlayer>(
      (player): player is AllowedSuperPlayer =>
        player.id === this.playerId && player.isAllowed(),
      "Нет права закончить ход",
    );
    makeMagic.call(this, player.makeStopMove());
  } catch (error) {
    throw error;
  }
}
