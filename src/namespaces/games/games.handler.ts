import { GamesIO } from "./games.types";
import assertGuestSocket from "../lobbies/helpers/assert-guest-socket";
import { durakGames, gamesNamespace } from "../../index";
import DurakGame from "../../durak-game/durak-game";
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

  if (game.stat.roundNumber === 0) game.start(this.namespace);

  if (game.players.isDefender(player)) {
    game.gameService.revealDefendUI({ accname: player.info.accname });
  }
  if (game.players.isAttacker(player)) {
    game.gameService.revealAttackUI({ accname: player.info.accname });
  }

  socket.emit("talon__showTrumpCard", game.talon.trumpCard);

  socket.on("state__restore", () => socket.emit("state__restore", game.restoreState({ accname })));

  socket.on("player__placeCard", (card, slotIndex, callback) => {
    try {
      handleInsertCardOnDesk.call({ socket, game, accname }, card, slotIndex, callback);
    } catch (error) {
      game.gameService.handleError({ accname, error });
      callback({ status: "NOK", message: (error as Error).message });
    }
  });

  socket.on("defend__takeCards", () => {
    let player = game.players.tryGetPlayer({ accname });
    if (!game.players.isDefender(player)) throw new Error("Вы не защищаетесь");

    game.gameService
      .hideDefendUI({ accname })
      .hideAttackUI({ accname: player.right.info.accname });

    player = game.players.makePlayer({ accname });

    player.hand.receiveCards(...game.desk.cards);
    game.desk.clear();

    let { missingNumberOfCards } = player.right;
    let talonCards = game.talon.popCards(missingNumberOfCards);
    if (missingNumberOfCards > talonCards.length) {
      console.log("No more cards in talon");
    }

    player.right.receiveCards(...talonCards);

    game.players.makeAttacker({ accname: player.left.info.accname });
    game.players.makeDefender({ accname: player.left.left.info.accname });

    gamesNamespace.emit("discard__pushCards");
  });

  socket.on("attack__stopAttack", () => {
    const player = game.players.tryGetPlayer({ accname });
    if (!game.players.isAttacker(player)) throw new Error("Вы не атакуете");

    game.gameService.hideAttackUI({ accname });

    // make new turn
    // allowDefenderToDefend
    //game.desk.stopAttack({ accname });
  });

  console.log("МОЯ ИГРА", gameId, ":", game.talon.count);
}