import { Hand } from "../Deck";
import NonLinkedGamePlayer from "./NonLinkedGamePlayer";
import { NonStartedGameUser } from "./NonStartedGameUser";
import type GamePlayerWebsocketService from "./Player.service";
import Players from "./Players";
import SidePlayersIndexes from "./SidePlayersIndexes";
import { Player } from "./index";

// ! Player#left & Player#right is buggy, should add test !
// TODO: add test
export class StartedDurakGamePlayers extends Players {
  constructor(
    nonStartedGameUsers: NonStartedGameUser[],
    wsPlayerService: GamePlayerWebsocketService
  ) {
    super(
      nonStartedGameUsers
        .map(
          (player) => new NonLinkedGamePlayer(player, wsPlayerService, new Hand())
        )
        .map((player) => new Player(player))
    );
    this.value.forEach((player, index, players) => {
      const indexes = new SidePlayersIndexes(index, players.length);
      player.left = players[indexes.leftPlayerIndex];
      player.right = players[indexes.rightPlayerIndex];
    });
  }
}
