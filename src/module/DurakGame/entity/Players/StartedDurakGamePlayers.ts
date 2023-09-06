import { Hand } from "../Deck";
import NonLinkedGamePlayer from "../__Player/NonLinkedGamePlayer";
import { NonStartedGameUser } from "../__Player/NonStartedGameUser";
import type GamePlayerWebsocketService from "../__Player/Player.service";
import {Players} from "./Players";
import SidePlayersIndexes from "../__Player/SidePlayersIndexes";
import { Player } from "../__Player/index";

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
