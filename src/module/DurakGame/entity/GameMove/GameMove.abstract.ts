import type Player from "../Player/Player";
import type DurakGame from "../../DurakGame.implimetntation";
import type Card from "../Card";

export abstract class GameMove<P extends Player> {
  #player: P;
  game: DurakGame;
  abstract defaultBehaviour: NodeJS.Timeout;
  abstract defaultBehaviourCallTimeInUTC: number;
  isInsertMove: boolean;

  protected constructor({ player, game }: { player: P; game: DurakGame }) {
    this.#player = player;
    this.game = game;
    this.isInsertMove = false;
  }

  get player() {
    return this.game.players.get(
      (player) => player.id === this.#player.id,
    );
  }

  abstract putCardOnDesk(card: Card, index: number): Promise<void>;

  abstract stopMove(): void;

  abstract allowsTransferMove(
    card: Card,
    slotIndex: number,
  ): Promise<boolean> | never;
}

export interface AfterHandler {
  handleAfterMoveIsDone(): void;
}

export default GameMove