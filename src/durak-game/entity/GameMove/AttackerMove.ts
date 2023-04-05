import Attacker from "../Players/Attacker";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export type AttackerMoveConstructorArgs = GameMoveConstructorArgs<Attacker>;

export class AttackerMove extends GameMove {
  constructor({ player, deskCardCount }: GameMoveConstructorArgs<Attacker>) {
    super({ player, deskCardCount });
  }
}