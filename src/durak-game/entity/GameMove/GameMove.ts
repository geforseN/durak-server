import Player from "../Players/Player";

export type GameMoveConstructorArgs<P extends Player> = { number: number, allowedPlayer: P, deskCardCount: number };

export abstract class GameMove {
  number: number;
  allowedPlayer: Player;
  deskCardCount: number;

  protected constructor({ number, allowedPlayer, deskCardCount }: GameMoveConstructorArgs<Player>) {
    this.number = number;
    this.allowedPlayer = allowedPlayer;
    this.deskCardCount = deskCardCount;
  }

  get allowedPlayerAccname() {
    return this.allowedPlayer.info.accname;
  }
}