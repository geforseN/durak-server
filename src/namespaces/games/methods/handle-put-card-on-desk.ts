import Card from "../../../durak-game/entity/Card";
import DurakGame from "../../../durak-game/durak-game";
import DeskSlot from "../../../durak-game/entity/DeskSlot";
import { GameSocket } from "../game.service";

export type SlotInfo = { slot: DeskSlot, slotIndex: number };
export type PlaceCardData = { game: DurakGame, card: Card } & SlotInfo;

export default function handlePutCardOnDesk(
  this: { game: DurakGame, accname: string } & GameSocket,
  card: Card,
  slotIndex: number,
  callback: any,
) {
  const { game, socket, accname } = this;
  if (!accname) throw new Error("Вы вне игры");

  const player = game.players.tryGetPlayer({ accname });

  if (!player.hand.has({ card })) throw new Error("Нет такой карты");

  const slot = game.desk.getSlot({ index: slotIndex });

  if (game.players.isDefender(player) || game.players.isAttacker(player)) {
    player.putCardOnDesk({ game, slotIndex, card, socket });
    /* return */callback({ status: game.players.isAttacker(player) ? "ATT" : "DEF" });
  } else throw new Error("У вас нет прав ложить карту на стол");
}
