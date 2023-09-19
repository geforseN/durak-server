import type DurakGame from "../../DurakGame.js";
import type { AllowedSuperPlayer } from "../../entity/Player/AllowedSuperPlayer.abstract.js";

export default async function handleStopMove(this: {
  game: DurakGame;
  playerId: string;
}) {
  const player = this.game.players.get<AllowedSuperPlayer>(
    (player): player is AllowedSuperPlayer =>
      player.id === this.playerId && player.isAllowed(),
    "Нет права закончить ход",
  );
  await player.makeNewMove();
}
