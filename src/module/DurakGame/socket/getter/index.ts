import assert from "node:assert";
import DurakGame from "../../DurakGame.implimetntation";
import Card from "../../entity/Card";
import { Player } from "../../entity/Player";
import { CardDTO } from "../../DTO";

export function getPlayer(game: DurakGame, playerId: string): Player | never {
  const player = game.players.get(
    (player) => player.id === playerId,
  );
  assert.ok(player.isSuperPlayer, "У вас нет прав ложить карту на стол");
  assert.ok(game.round.currentMove.player === player, "У вас нет права ходить");
  return player;
}

export function getCard(
  card: CardDTO,
  game: DurakGame,
  player: Player,
): Card | never {
  assert.ok(player.hand.has(card), "У вас нет такой карты");
  // TODO const player.hand.get(card)
  // NOTE player.hand.get should throw if not card was found
  return new Card({ ...card, isTrump: game.talon.trumpSuit === card.suit });
}
