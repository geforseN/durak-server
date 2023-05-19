import { Player } from "./index";
import Card from "../Card";
import CardDTO from "../../DTO/Card.dto";
import { DurakGameSocket } from "../../socket/DurakGameSocket.types";

export default class GamePlayerService {
  constructor(private namespace: DurakGameSocket.Namespace) {
  }

  receiveCards({ player, cards }: { player: Player, cards: Card[] }) {
    this.namespace.to(player.id).emit("player__receiveCards", cards.map((card => new CardDTO(card))));
    this.namespace.except(player.id).emit("player__changeCardCount", player.id, player.hand.count);
  }

  removeCard({ player, card }: { player: Player, card: Card }) {
    this.namespace.to(player.id).emit("superPlayer__removeCard", new CardDTO(card));
    this.namespace.except(player.id).emit("player__changeCardCount", player.id, player.hand.count);
  }
}