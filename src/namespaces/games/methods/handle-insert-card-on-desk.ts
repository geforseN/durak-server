import { GamesIO } from "../games.types";
import Card from "../../../durak-game/entity/Card";
import DurakGame from "../../../durak-game/durak-game";
import Player from "../../../durak-game/entity/Players/Player";
import DeskSlot from "../../../durak-game/entity/DeskSlot";

export type SlotInfo = { slot: DeskSlot, slotIndex: number };
export type PlaceCardData = { game: DurakGame, card: Card } & SlotInfo;
export interface CardInsert {
  handleCardInsert({ game, card, slot, slotIndex }: PlaceCardData): void | never;
}

export default function handleInsertCardOnDesk(
  this: { socket: GamesIO.SocketIO, game: DurakGame, accname: GamesIO.SocketIO["data"]["accname"] },
  card: Card,
  slotIndex: number,
) {
  const { game, socket, accname } = this;
  if (!accname) return socket.disconnect();

  const player = game.players.getPlayer({ accname });
  if (!player) throw new Error("Нет такого игрока");

  if (!player.hand.has({ card })) throw new Error("Нет такой карты");

  const slot = game.desk.getSlot({ index: slotIndex });

  if (Player.isDefender(player) || Player.isAttacker(player)) {
    return player.handleCardInsert({ game, slot, slotIndex, card });
  } else {
    socket.disconnect();
  }
}
