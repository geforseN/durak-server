import { Namespace, Socket } from "socket.io";
import Card from "../../durak-game/entity/card";

export namespace GamesIO {
  export type ClientToServerEvents = {
    "firstDistribution": () => void
    "playersIndexes": () => void
  }

  export type ServerToClientEvents = {
    "playersIndexes": (indexes: ({ accname: string, index: number })[]) => void
    "firstDistribution:me": (cards: Card[]) => void
    "firstDistribution": (accname: string, cardCount: number) => void
  }

  export type InterServerEvents = {
  }

  export type SocketData = {
    accname: string
    role?: "USER" | "GUEST"
    badTriesCount?: number
  }

  export type SocketIO = Socket<
    GamesIO.ClientToServerEvents,
    GamesIO.ServerToClientEvents,
    GamesIO.InterServerEvents,
    GamesIO.SocketData
  >

  export type NamespaceIO = Namespace<
    GamesIO.ClientToServerEvents,
    GamesIO.ServerToClientEvents,
    GamesIO.InterServerEvents,
    GamesIO.SocketData
  >
}