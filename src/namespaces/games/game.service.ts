import { GamesIO } from "./games.types";
import Card from "../../durak-game/entity/Card";
import NotificationAlert from "../../module/notification-alert";
import Player from "../../durak-game/entity/Players/Player";
import DurakGameStateDto from "../../durak-game/DTO/DurakGameState.dto";
import DurakGame from "../../durak-game/DurakGame";

export type GameSocket = { socket: GamesIO.SocketIO };

export class GameService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  /* @TODO replace me in SuperPlayerService */
  removeCard({ player, card }: { player: Player, card: Card }) {
    this.namespace.to(player.id).emit("self__removeCard", card);
    this.namespace.except(player.id).emit("enemy__changeCardCount", player.id, player.hand.count);
  }

  lostRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__lostRound", defender.id, round.number);
  }

  wonRound({ game }: { game: DurakGame }) {
    const { players: { defender }, round } = game;
    this.namespace.emit("defender__wonRound", defender.id, round.number);
  }

  handleError({ accname, error }: { error: unknown, accname: string }) {
    console.log("ERROR: ", error);
    const notification = new NotificationAlert().fromError(error as Error);
    this.namespace.to(accname).emit("notification__send", notification);
  }

  restoreState({ socket, game, playerId }: { game: DurakGame, playerId: string } & GameSocket) {
    socket.emit("state__restore", new DurakGameStateDto(game, playerId));
  }

  end(game: DurakGame) {
    this.namespace.emit("game__over")
  }
}
