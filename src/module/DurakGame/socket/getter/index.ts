import assert from "node:assert";
import DurakGame from "../../DurakGame.implimetntation";
import Card from "../../entity/Card";
import { Player } from "../../entity/Player";
import { CardDTO } from "../../DTO";

export function getPlayer(game: DurakGame, id: string): Player | never {
  const player = game.players.getPlayer({ id });
  assert.ok(game.players.isSuperPlayer(player), "У вас нет прав ложить карту на стол");
  assert.ok(game.round.isCurrentMoveAllowedTo(player), "У вас нет права ходить");
  return player;
}

export function getCard(card: CardDTO, game: DurakGame, player: Player): Card | never {
  assert.ok(player.hand.has({ card }), "У вас нет такой карты");
  return new Card({ ...card, isTrump: game.talon.trumpSuit === card.suit });
}