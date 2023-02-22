import Card from "../../../durak-game/entity/Card";
import DurakGame from "../../../durak-game/durak-game";
import { GameSocket } from "../game.service";
import { ResponseCallback } from "../games.types";

export type PlaceCardData = { game: DurakGame, card: Card, slotIndex: number };

export default function handlePutCardOnDesk(
  this: { game: DurakGame, accname: string } & GameSocket,
  card: Card,
  slotIndex: number,
  callback: ResponseCallback,
) {
  const { game, socket, accname } = this;
  if (!accname) throw new Error("Вы вне игры");

  if (game.round.currentMove.allowedPlayerAccname !== accname) {
    throw new Error("У вас нет права ходить");
  }

  const player = game.players.tryGetPlayer({ accname });
  if (!player.hand.has({ card })) throw new Error("У вас нет такой карты");

  if (game.players.isDefender(player) || game.players.isAttacker(player)) {
    player.putCardOnDesk({ game, slotIndex, card, socket });
    return callback({ status: game.players.isAttacker(player) ? "ATT" : "DEF" });
  } else throw new Error("У вас нет прав ложить карту на стол");
}
