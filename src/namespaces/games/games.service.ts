import { GamesIO } from "./games.types";
import { GameId, io } from "../../index";
import { LobbyUserIdentifier } from "../lobbies/entity/lobby-users";
import Card from "../../durak-game/entity/Card";

export class GamesService {
  private namespace: GamesIO.NamespaceIO;

  constructor(gameId: GameId) {
    this.namespace = io.of(gameId);
  }

  insertAttackCard({ card, index, socket }: { card: Card, index: number, socket: GamesIO.SocketIO }) {
    socket.broadcast.emit("desk__insertAttackCard", card, index);
  }

  insertDefendCard({ card, index, socket }: { card: Card, index: number, socket: GamesIO.SocketIO }) {
    socket.broadcast.emit("desk__insertDefendCard", card, index);
  }

  changeCardCount({ accname, cardCount, socket }: { accname: string, cardCount: number, socket: GamesIO.SocketIO }) {
    socket.except(accname).emit("enemies__changeCardCount", accname, cardCount);
  }

  hideAttackUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("attackUI__shouldShow", false);
  }

  revealAttackUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("attackUI__shouldShow", true);
  }

  hideDefenderUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("defendUI__shouldShow", false);
  }

  revealDefenderUI({ accname }: LobbyUserIdentifier) {
    this.namespace.to(accname).emit("defendUI__shouldShow", true);
  }
}