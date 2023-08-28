import type DurakGame from "../../DurakGame";
import type { Player } from "./index";
import Players from "./Players";


export class NonEmptyPlayers extends Players {
  constructor(game: DurakGame) {
    super(
      game.players.value.reduce((nonEmptyPlayers: Player[], player) => {
        if (player.hand.isEmpty) {
          player.exitGame(game);
        } else {
          nonEmptyPlayers.push(player);
        }
        return nonEmptyPlayers;
      }, [])
    );
  }
}
