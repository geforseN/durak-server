import Player from "../Players/Player";

export type GameMoveConstructorArgs<P extends Player> = { number: number, allowedPlayer: P }

export class GameMove {
  number: number;
  allowedPlayer: Player;

  constructor({ number, allowedPlayer }: GameMoveConstructorArgs<Player>) {
    this.number = number;
    this.allowedPlayer = allowedPlayer;
  }

  get allowedPlayerAccname() {
    return this.allowedPlayer.info.accname;
  }
}