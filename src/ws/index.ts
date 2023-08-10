import WebSocket from "ws";
import assert from "node:assert";
import { User } from "@prisma/client";

export const defaultListeners = {
  everySocket(this: WebSocket[], event: CustomWebsocketEvent) {
    const message = event.asString;
    this.forEach((socket) => socket.send(message));
  },
  socket(this: WebSocket, event: CustomWebsocketEvent) {
    this.send(event.asString);
  },
  message(this: WebSocket, data: WebSocket.RawData, _isBinary: boolean) {
    const parsedData = JSON.parse(data.toString());
    assert.ok(typeof parsedData === "object" && parsedData !== null);
    const { eventName, payload } = parsedData;
    assert.ok(typeof eventName === "string");
    assert.ok(typeof payload === "object" && payload !== null);
    this.emit(eventName, payload);
  },
};

export function addUserSocketInRoom<
  UserSockets extends Map<string, Set<WebSocket>>,
>(this: { userSockets: UserSockets }, socket: WebSocket, userId?: string) {
  if (!userId) return;
  if (!this.userSockets.has(userId)) {
    this.userSockets.set(userId, new Set([socket]));
  } else {
    this.userSockets.get(userId)?.add(socket);
  }
}

export class CustomWebsocketEvent {
  constructor(public eventName: string) {}

  get asString() {
    return JSON.stringify({
      eventName: this.eventName,
      payload: { ...this, eventName: undefined },
    });
  }
}

export class SocketsStore {
  #value: Set<WebSocket>;
  #userSockets: Map<User["id"], Set<WebSocket>>;

  constructor() {
    this.#value = new Set<WebSocket>();
    this.emitSockets = this.emitSockets.bind(this);
    this.#userSockets = new Map<User["id"], Set<WebSocket>>();
  }

  emitSockets(event: CustomWebsocketEvent) {
    const message = event.asString;
    this.#value.forEach((socket) => socket.send(message));
  }

  add(socket: WebSocket) {
    this.#value.add(socket);
  }

  room(userId: string) {
    if (!userId) return { add: () => {} };
    return {
      add: (socket: WebSocket) => {
        if (!this.#userSockets.has(userId)) {
          this.#userSockets.set(userId, new Set([socket]));
        } else {
          this.#userSockets.get(userId)?.add(socket);
        }
      },
    };
  }

  delete(socket: WebSocket) {
    const isExisted = this.#value.delete(socket);
    assert.ok(isExisted, "Provided socket wasn't found in store");
  }
}
