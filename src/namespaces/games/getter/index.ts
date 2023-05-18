import DurakGame from "../../../module/durak-game/DurakGame";
import Card from "../../../module/durak-game/entity/Card";
import { Player } from "../../../module/durak-game/Players";
import assert from "node:assert";
import CardDTO from "../../../module/durak-game/DTO/Card.dto";

export function getPlayer(game: DurakGame, id: string): Player | never {
  const player = game.players.getPlayer({ id });
  assert.ok(game.round.isCurrentMoveAllowedTo(player), "У вас нет права ходить");
  return player;
}

export function getPlacedCard(card: CardDTO, game: DurakGame, player: Player): Card | never {
  assert.ok(player.hand.has({ card }), "У вас нет такой карты");
  return new Card({ ...card, isTrump: game.talon.trumpSuit === card.suit });
}