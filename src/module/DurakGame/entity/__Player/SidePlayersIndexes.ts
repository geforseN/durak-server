export default class SidePlayersIndexes {
  constructor(public playerIndex: number, public playersCount: number) {}
  get leftPlayerIndex() {
    const isLastPlayer = this.playerIndex === this.playersCount - 1;
    return isLastPlayer ? 0 : this.playerIndex + 1;
  }
  get rightPlayerIndex() {
    const isFirstPlayer = this.playerIndex === 0;
    return isFirstPlayer ? this.playersCount - 1 : this.playerIndex - 1;
  }
}
