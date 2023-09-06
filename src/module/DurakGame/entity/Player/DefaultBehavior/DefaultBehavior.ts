import DurakGame from "../../../DurakGame";
import { GameMove } from "../../GameMove";
import { AllowedSuperPlayer } from "../AllowedSuperPlayer.abstract";

export default abstract class DefaultBehavior<ASP extends AllowedSuperPlayer> {
  public shouldBeCalled: boolean;
  public callTime?: { UTC: number };
  timeout?: NodeJS.Timeout;
  protected readonly game: DurakGame;
  allowedPlayer: ASP;

  constructor(
    allowedPlayer: ASP,
    game = allowedPlayer.game,
    shouldBeCalled = true,
  ) {
    this.allowedPlayer = allowedPlayer;
    this.game = game;
    this.shouldBeCalled = shouldBeCalled;
  }

  protected abstract callback(): Promise<void | GameMove<ASP>>;

  setTimeout(delay = this.game.settings.moveTime) {
    this.callTime = { UTC: Date.now() + this.game.settings.moveTime };
    this.timeout = setTimeout(this.callback, delay);
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }
}
