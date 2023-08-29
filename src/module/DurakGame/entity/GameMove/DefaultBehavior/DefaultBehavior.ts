import DurakGame from "../../../DurakGame";
import { Player } from "../../Player";
import GameMove from "../GameMove.abstract";

export default abstract class DefaultBehavior<Performer extends Player> {
  protected abstract callback: () => Promise<void>;
  protected readonly move: GameMove<Performer>;
  public shouldBeCalled: boolean;
  public readonly callTime: { UTC: number };
  timeout?: NodeJS.Timeout;
  protected readonly game: DurakGame;

  constructor(move: GameMove<Performer>, shouldBeCalled = true) {
    this.move = move;
    this.game = move.game;
    this.shouldBeCalled = shouldBeCalled;
    this.callTime = { UTC: Date.now() + move.game.settings.moveTime };
  }

  setTimeout(delay = this.game.settings.moveTime) {
    this.timeout = setTimeout(this.callback, delay);
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }
}
