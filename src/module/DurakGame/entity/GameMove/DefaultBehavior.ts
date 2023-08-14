import GameMove from "./GameMove.abstract";

export default abstract class DefaultBehavior<Move extends GameMove> {
  protected abstract value: NodeJS.Timeout;
  protected readonly move: Move;
  public readonly shouldBeCalled: boolean;
  public readonly callTime: { UTC: number };

  constructor(move: Move) {
    this.move = move;
    this.shouldBeCalled = true;
    this.callTime = { UTC: Date.now() + move.game.settings.moveTime };
  }

  stop() {
    clearTimeout(this.value);
  }
}
