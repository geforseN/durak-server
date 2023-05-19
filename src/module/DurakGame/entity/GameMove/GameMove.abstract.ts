import Player from "../Player/Player";
import DurakGame from "../../DurakGame.implimetntation";
import Card from "../Card";

export abstract class GameMove<P extends Player> {
  player: P;
  game: DurakGame;
  abstract defaultBehaviour: NodeJS.Timeout;

  protected constructor({ player, game }: { player: P, game: DurakGame }) {
    this.player = player;
    this.game = game;
  }

  abstract putCardOnDesk(card: Card, index: number): Promise<void>

  abstract stopMove(): void
}