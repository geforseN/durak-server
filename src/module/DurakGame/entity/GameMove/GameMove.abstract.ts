import Player from "../Player/Player";
import DurakGame from "../../DurakGame.implimetntation";
import Card from "../Card";

export abstract class GameMove<P extends Player> {
  player: P; // TODO rename to #player
  game: DurakGame;
  abstract defaultBehaviour: NodeJS.Timeout;
  abstract defaultBehaviourCallTimeInUTC: number;

  protected constructor({ player, game }: { player: P; game: DurakGame }) {
    this.player = player;
    this.game = game;
  }

  // TODO rename to player
  get _player() {
    return this.game.players.getPlayer({ id: this.player.id });
    // TODO use
    // return this.game.players.getPlayer({ id: this.#player.id });
  }

  abstract putCardOnDesk(card: Card, index: number): Promise<void>;

  abstract stopMove(): void;

  abstract allowsTransferMove(
    card: Card,
    slotIndex: number,
  ): Promise<boolean> | never;
}
