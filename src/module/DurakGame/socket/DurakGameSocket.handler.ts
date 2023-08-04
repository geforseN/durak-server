import assert from "assert";
import { DurakGameSocket } from "./DurakGameSocket.types";
import { durakGames } from "../../../index";
import { cardPlaceListener, stopMoveListener } from "./listener";
import DurakGame from "../DurakGame";
import { NonStartedDurakGame } from "../NonStartedDurakGame";
import prisma from "../../../../prisma";

export default function durakGameSocketHandler(
  this: DurakGameSocket.Namespace,
  socket: DurakGameSocket.Socket,
) {
  setTimeout(Promise.reject, 30_000);
  const {
    nsp: { name: gameId },
  } = socket;
  let playerId = socket.data.userProfile?.userId;
  // TODO const startedDurakGames = new Map()
  // TODO const nonStartedDurakGames = new Map()
  let game = durakGames.get(gameId);
  socket.onAny((eventName: string, ...args) => console.log(eventName, args));
  if (!game) return handleNoSuchGameOnline(socket);
  if (!playerId) return handleNotAuthorized(socket);
  if (!game.isStarted) {
    // nonStartedGame.increasePlayersCountIfPlayerFirstlyConnected
    game.addPlayer(socket);
    // THEN after all connected emit nonStartedGame::start
    socket.on("nonStartedGame::start", (playerSocket: typeof socket) => {
      // ! prisma.user.update({
      //   where: { id: playerId },
      //   data: { currentGameId: game?.info.id },
      // });
      assert.ok(game instanceof DurakGame);
      socket.on(
        "superPlayer__putCardOnDesk",
        cardPlaceListener.bind({ game, playerId }),
      );
      socket.on(
        "superPlayer__stopMove",
        stopMoveListener.bind({ game, playerId }),
      );
      socket.on("player__exitGame", () => {
        try {
          game.players.remove((player) => player.id === playerId);
        } catch (error) {
          console.log(error);
        }
      });
    });
  } else {
    socket.on(
      "superPlayer__putCardOnDesk",
      cardPlaceListener.bind({ game, playerId }),
    );
    socket.on(
      "superPlayer__stopMove",
      stopMoveListener.bind({ game, playerId }),
    );
    socket.on("player__exitGame", () => {
      try {
        game.players.remove((player) => player.id === playerId);
      } catch (error) {
        console.log(error);
      }
    });
  }

  if (!game.isStarted) {
    // game.updateTo(new DurakGame, durakGames)
    const startedGame = new DurakGame(game, this);
    durakGames.set(gameId, startedGame);
    game = startedGame;
  }
  assert.ok(game.isStarted);
  try {
    const player = game.players.get((player) => player.id === playerId);
    this.to(player.id).emit("game__currentId", game.info.id);
    game.restoreState(socket, player.id);
  } catch (error) {
    if (error instanceof Error) console.log("RESTORE STATE ERROR", error);
    else console.log("IDK", error);
  }
  socket.on(
    "superPlayer__putCardOnDesk",
    cardPlaceListener.bind({ game, playerId }),
  );
  socket.on("superPlayer__stopMove", stopMoveListener.bind({ game, playerId }));
  socket.on("player__exitGame", () => {
    try {
      assert.ok(game instanceof DurakGame);
      game.players.remove((player) => player.id === playerId);
    } catch (error) {
      console.log(error);
    }
  });
}

function handleNoSuchGameOnline(socket: DurakGameSocket.Socket) {
  // console.log("no such game")
  socket.disconnect();
}

function handleNotAuthorized(socket: DurakGameSocket.Socket) {
  socket.disconnect();
}

function isGameNotStarted(
  game: DurakGame | NonStartedDurakGame,
): game is NonStartedDurakGame {
  return game.info.isStarted;
}

function gameIsStarted(
  game: DurakGame | NonStartedDurakGame | undefined,
): game is DurakGame {
  return game?.info.isStarted || false;
}
