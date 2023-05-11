import DurakGame from "../../../durak-game/DurakGame";
import Card from "../../../durak-game/entity/Card";
import { Player } from "../../../durak-game/entity/Players";
import { ensureHasCard, ensureIsAllowedToMove } from "../assert";

export function getPlayer(game: DurakGame, id: string) {
  const player = game.players.getPlayer({ id });
  ensureIsAllowedToMove(player, game);
  return player;
}

export function getPlacedCard({ rank, suit }: Pick<Card, "rank" | "suit">, game: DurakGame, player: Player) {
  ensureHasCard(player, { rank, suit });
  return new Card({ rank, suit, isTrump: game.talon.trumpSuit === suit });
}