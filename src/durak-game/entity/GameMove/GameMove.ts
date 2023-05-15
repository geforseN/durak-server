import Player from "../Players/Player";
import DurakGame from "../../DurakGame";

export abstract class GameMove<P extends Player> {
  player: P;
  game: DurakGame;
  abstract defaultBehaviour: NodeJS.Timeout

  constructor({ player, game }: { player: P, game: DurakGame }) {
    this.player = player;
    this.game = game;
  }
}