import type { Hand } from "../Deck";
import type GamePlayerWebsocketService from "./Player.service";
import { NonStartedGameUser } from "./NonStartedGameUser";
import Player from "./Player";

export default class NonLinkedGamePlayer extends Player {
  constructor(
    user: NonStartedGameUser,
    wsService: GamePlayerWebsocketService,
    hand: Hand,
  ) {
    super(user, { wsService, hand });
  }
}
