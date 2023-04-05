import Player from "../Players/Player";

export type GameMoveConstructorArgs<P extends Player> = { player: P, deskCardCount: number };

export abstract class GameMove {
  player: Player;
  deskCardCount: number;

  protected constructor({ player, deskCardCount }: GameMoveConstructorArgs<Player>) {
    this.player = player;
    this.deskCardCount = deskCardCount;
  }

  get playerId() {
    return this.player.info.accname;
  }
}