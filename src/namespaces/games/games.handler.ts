import { GamesIO } from "./games.types";
import assertGuestSocket from "../lobbies/helpers/assert-guest-socket";
import { durakGames, gamesNamespace } from "../../index";
import DurakGame, { isAttacker, isDefender, makePlayer } from "../../durak-game/durak-game";
import handleInsertCardOnDesk from "./methods/handle-insert-card-on-desk";
import NotificationAlert from "../../module/notification-alert";

export default function gamesHandler(
  this: { namespace: GamesIO.NamespaceIO },
  socket: GamesIO.SocketIO,
) {
  try {
    assertGuestSocket(socket);
  } catch (e) {
    socket.disconnect();
  }
  const { data: { accname }, nsp: { name: gameId } } = socket;

  const game: DurakGame | undefined = durakGames.get(gameId);
  if (!game || !accname) return socket.disconnect();

  const player = game.players.getPlayer({ accname });
  if (!player) return socket.disconnect();

  if (game.stat.roundNumber === 0) game.start();

  socket.on("state__restore", () => socket.emit("state__restore", game.restoreState({ accname })));

  socket.on("player__placeCard", (card, slotIndex, callback) => {
    try {
      handleInsertCardOnDesk.call({ socket, game, accname }, card, slotIndex, callback);
    } catch (error) {
      console.log("ERROR", error);
      const notification = new NotificationAlert().fromError(error as Error);
      this.namespace.to(accname).emit("notification__send", notification);
      callback({ status: "NOK", message: (error as Error).message});
    }
  });

  socket.on("player__placeCard", handleInsertCardOnDesk.bind({socket, game, accname}));

  socket.on("attack__stopAttack", () => {
    //assertSelfIsAttacker({ game , accname});
    game.gameService.hideAttackUI({ accname });
    // allowDefenderToDefend
    //game.desk.stopAttack({ accname });
  });

  socket.on("defend__takeCards", () => {
    //assertSelfIsDefender(game, socket.data.accname);
    game.gameService.hideDefenderUI({ accname });
    game.gameService.hideAttackUI({ accname });
    gamesNamespace.emit("discard__pushCards");
  });

  console.log("МОЯ ИГРА", gameId, ":", game.talon.count);
}