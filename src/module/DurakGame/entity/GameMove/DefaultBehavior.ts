import GameMove from "./GameMove.abstract";

export default abstract class DefaultBehavior<Move extends GameMove> {
  protected abstract value: NodeJS.Timeout;
  protected readonly move: Move;
  public shouldBeCalled: boolean;
  public readonly callTime: { UTC: number };

  constructor(move: Move, shouldBeCalled = true) {
    this.move = move;
    this.shouldBeCalled = shouldBeCalled;
    this.callTime = { UTC: Date.now() + move.game.settings.moveTime };
  }

  stop() {
    clearTimeout(this.value);
  }
}
