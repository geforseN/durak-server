import { GamesIO } from "./games.types";
import assertGuestSocket from "../lobbies/helpers/assert-guest-socket";
import { durakGames } from "../../index";
import DurakGame from "../../durak-game/durak-game";
import handleInsertCardOnDesk from "./methods/handle-insert-card-on-desk";
import handleStopAttack from "./methods/handle-stop-attack";

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

  if (game.stat.roundNumber === 0) game.start(this.namespace);
  if (game.players.isDefender(player)) game.service.revealDefendUI({ accname });
  if (game.players.isAttacker(player)) game.service.revealAttackUI({ accname });

  socket.emit("talon__showTrumpCard", game.talon.trumpCard);

  socket.on("state__restore", () => socket.emit("state__restore", game.restoreState({ accname })));

  socket.on("player__placeCard", (card, slotIndex, callback) => {
    try {
      handleInsertCardOnDesk.call({ socket, game, accname }, card, slotIndex, callback);
    } catch (error) {
      game.service.handleError({ accname, error });
      callback({ status: "NOK", message: (error as Error).message });
    }
  });

  socket.on("defend__stopDefend", () => {
    try {
      handleStopAttack.call({ socket, game, accname });
    } catch (error) {
      game.service.handleError({ accname, error });
    }
  });

  socket.on("attack__stopAttack", () => {
    const player = game.players.tryGetPlayer({ accname });
    if (!game.players.isAttacker(player)) throw new Error("Вы не атакуете");

    game.service.hideAttackUI({ accname });

    // make new turn
    // allowDefenderToDefend
    //game.desk.stopAttack({ accname });
  });

  console.log("МОЯ ИГРА", gameId, ":", game.talon.count);
}