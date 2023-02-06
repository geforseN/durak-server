import CardPlayer from "../../../durak-game/entity/card-player";
import Card from "../../../durak-game/entity/card";

export default function assertPlayerHasCard({player, card}: {player: CardPlayer, card: Card}) {
  if (!player.hand.has({card})) throw new Error("Нет такой карты");
}