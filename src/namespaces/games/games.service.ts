import { GamesIO } from "./games.types";
import { LobbyUserIdentifier } from "../lobbies/entity/lobby-users";
import Card from "../../durak-game/entity/Card";

export type GameSocket = { socket: GamesIO.SocketIO };

export class GamesService {
  constructor(private namespace: GamesIO.NamespaceIO) {
  }

  insertAttackCard({ card, index, socket }: { card: Card, index: number } & GameSocket) {
    socket.broadcast.emit("desk__insertAttackCard", card, index);
  }

  insertDefendCard({ card, index, socket }: { card: Card, index: number } & GameSocket) {
    socket.broadcast.emit("desk__insertDefendCard", card, index);
  }

  changeCardCount({ accname, cardCount, socket }: { accname: string, cardCount: number } & GameSocket) {
    socket.except(accname).emit("enemies__changeCardCount", accname, cardCount);
  }

  removeCard({ accname, card, socket }: { accname: string, card: Card } & GameSocket) {
    socket.to(accname).emit("self__removeCard", card);
  }

  hideAttackUI({ accname }: LobbyUserIdentifier): this {
    this.namespace.to(accname).emit("attackUI__shouldShow", false);
    return this;
  }

  revealAttackUI({ accname }: LobbyUserIdentifier): this {
    this.namespace.to(accname).emit("attackUI__shouldShow", true);
    return this;
  }

  hideDefendUI({ accname }: LobbyUserIdentifier): this {
    this.namespace.to(accname).emit("defendUI__shouldShow", false);
    return this;
  }

  revealDefendUI({ accname }: LobbyUserIdentifier): this {
    this.namespace.to(accname).emit("defendUI__shouldShow", true);
    return this;
  }
}