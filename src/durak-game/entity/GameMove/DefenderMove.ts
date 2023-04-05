import Defender from "../Players/Defender";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export type DefenderMoveConstructorArgs = GameMoveConstructorArgs<Defender>;

export class DefenderMove extends GameMove {
  constructor({ player, deskCardCount }: DefenderMoveConstructorArgs) {
    super({ player, deskCardCount });
  }
}