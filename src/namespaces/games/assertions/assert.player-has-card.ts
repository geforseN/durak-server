import Player from "../../../durak-game/entity/Players/Player";
import Card from "../../../durak-game/entity/Card";

export default function assertPlayerHasCard({player, card}: {player: Player, card: Card}) {
  if (!player.hand.has({card})) throw new Error("Нет такой карты");
}