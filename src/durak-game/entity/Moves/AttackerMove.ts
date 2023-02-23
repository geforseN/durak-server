import Attacker from "../Players/Attacker";
import { GameMove, GameMoveConstructorArgs } from "./GameMove";

export class AttackerMove extends GameMove {
  constructor({ number, allowedPlayer }: GameMoveConstructorArgs<Attacker>) {
    super({ number, allowedPlayer });
  }
}