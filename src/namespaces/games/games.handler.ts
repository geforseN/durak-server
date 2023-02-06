import { GamesIO } from "./games.types";
import assertGuestSocket from "../lobbies/helpers/assert-guest-socket";
import { durakGames, gamesNamespace } from "../../index";
import { assertBeforeAttack } from "./assertions";
import DurakGame from "../../durak-game/durak-game";
import handleInsertCardOnDesk from "./methods/handle-insert-card-on-desk";

export default function gamesHandler(socket: GamesIO.SocketIO) {
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

  if (game.stat.roundNumber === 0) {
    game.makeFirstDistributionByOne();
    game.stat.roundNumber++;
  }

  socket.on("state__restore", () => {
    socket.emit("state__restore", game.restoreState({ accname }));
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

  socket.on("defend__beatCard", () => {
    // assertSelfIsDefender(game, socket.data.accname);
    //assertAllowedToPut(game, socket.data.accname);
    if (game.desk.isFull) {
      gamesNamespace.emit("desk__clear")
    }
  });

  console.log("МОЯ ИГРА", gameId, ":", game.talon.count);
}