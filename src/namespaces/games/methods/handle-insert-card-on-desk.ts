import Card from "../../../durak-game/entity/Card";
import DurakGame, { isAttacker, isDefender } from "../../../durak-game/durak-game";
import DeskSlot from "../../../durak-game/entity/DeskSlot";
import { GameSocket } from "../games.service";

export type SlotInfo = { slot: DeskSlot, slotIndex: number };
export type PlaceCardData = { game: DurakGame, card: Card } & SlotInfo;

export default function handleInsertCardOnDesk(
  this: { game: DurakGame, accname: string } & GameSocket,
  card: Card,
  slotIndex: number,
  callback: any,
) {
  const { game, socket, accname } = this;
  if (!accname) return socket.disconnect();

  const player = game.players.tryGetPlayer({ accname });

  if (!player.hand.has({ card })) throw new Error("Нет такой карты");

  const slot = game.desk.getSlot({ index: slotIndex });

  if (isDefender(player)) {
    player.handleCardInsert({ game, slot, slotIndex, card, socket });
    callback({ status: "DEF" });
  } else if (isAttacker(player)) {
    player.handleCardInsert({ game, slot, slotIndex, card, socket });
    callback({ status: "ATT" });
  } else socket.disconnect();
}
