import assert from "node:assert";

import type DurakGame from "../../../DurakGame.js";
import type { GameMove } from "../../GameMove/index.js";
import type { AllowedSuperPlayer } from "../AllowedSuperPlayer.abstract.js";

export default abstract class DefaultBehavior<ASP extends AllowedSuperPlayer> {
  allowedPlayer: ASP;
  public callTime?: { UTC: number };
  protected readonly game: DurakGame;
  public shouldBeCalled: boolean;
  timeout?: NodeJS.Timeout;

  constructor(
    allowedPlayer: ASP,
    game = allowedPlayer.game,
    shouldBeCalled = true,
  ) {
    this.allowedPlayer = allowedPlayer;
    this.game = game;
    this.shouldBeCalled = shouldBeCalled;
  }

  clearTimeout() {
    clearTimeout(this.timeout);
  }

  setTimeout(delay = this.game.settings.players.moveTime) {
    this.callTime = { UTC: Date.now() + this.game.settings.players.moveTime };
    this.timeout = setTimeout(async () => {
      const move = await this.makeMove();
      assert.ok(move, "this.makeMove returned falsy value");
      this.game.handleNewMove(move);
    }, delay);
  }

  protected abstract makeMove(): Promise<GameMove<ASP> | void>;
}
