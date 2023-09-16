import assert from "node:assert";
import DurakGame from "../../../DurakGame.js";
import { makeMagic } from "../../../socket/handler/makeMagic.js";
import { GameMove } from "../../GameMove/index.js";
import { AllowedSuperPlayer } from "../AllowedSuperPlayer.abstract.js";

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

  protected abstract makeMove(): Promise<void | GameMove<ASP>>;

  setTimeout(delay = this.game.settings.players.moveTime) {
    this.callTime = { UTC: Date.now() + this.game.settings.players.moveTime };
    this.timeout = setTimeout(async () => {
      const move = await this.makeMove();
      assert.ok(move, "this.makeMove returned falsy value");
      makeMagic.call({ game: this.game }, move);
    }, delay);
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }
}
