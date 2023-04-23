import Card from "../../../durak-game/entity/Card";
import DurakGame from "../../../durak-game/DurakGame";

export default async function handlePutCardOnDesk(
  this: { game: DurakGame, accname: string },
  { suit, rank }: Card,
  index: number,
) {
  const { game, accname: id } = this;
  const player = game.players.getPlayer({ id });
  if (!game.round.currentMoveAllowedTo(player)) {
    throw new Error("У вас нет права ходить");
  }
  const card = new Card({ rank, suit, isTrump: game.talon.trumpSuit === suit });
  if (!player.hand.has({ card })) {
    throw new Error("У вас нет такой карты");
  }
  if (game.players.isDefender(player)
    && game.desk.allowsTransferMove({ index, card, nextDefender: player.left })
  ) {
    return player.makeTransferMove({ game, index, card });
  }
  if (game.players.isSuperPlayer(player)) {
    return await player.putCardOnDesk({ game, index, card });
  } else throw new Error("У вас нет прав ложить карту на стол");
}
