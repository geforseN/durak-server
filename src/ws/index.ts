import type WebSocket from "ws";

import assert from "node:assert";

import NotificationAlert from "../module/NotificationAlert/index.js";

export const defaultListeners = {
  message(this: WebSocket, data: WebSocket.RawData, _isBinary: boolean) {
    const parsedData = JSON.parse(data.toString());
    assert.ok(typeof parsedData === "object" && parsedData !== null);
    const { eventName, payload } = parsedData;
    assert.ok(typeof eventName === "string");
    assert.ok(typeof payload === "object" && payload !== null);
    this.emit(eventName, payload);
  },

  socket(this: WebSocket, event: CustomWebsocketEvent) {
    this.send(event.asString);
  },
};

export class CustomWebsocketEvent {
  readonly eventName;
  constructor(eventName: string) {
    this.eventName = eventName;
  }

  get asString() {
    return JSON.stringify({
      eventName: this.eventName,
      payload: { ...this, eventName: undefined },
    });
  }
}

export class NotificationAlertEvent extends CustomWebsocketEvent {
  notificationAlert;

  constructor(error: Error) {
    super("notification::push");
    this.notificationAlert = new NotificationAlert(error);
  }
}

export class SocketsStore {
  #allSockets: Set<WebSocket>;
  #rooms: Map<string, Set<WebSocket>>;

  constructor() {
    this.#allSockets = new Set<WebSocket>();
    this.#rooms = new Map<string, Set<WebSocket>>();
    this.emit = this.emit.bind(this);
  }

  add(socket: WebSocket) {
    this.#allSockets.add(socket);
  }

  emit(event: CustomWebsocketEvent) {
    const data = event.asString;
    console.log({ data });
    this.#allSockets.forEach((socket) => socket.send(data));
  }

  remove(socket: WebSocket) {
    const isExisted = this.#allSockets.delete(socket);
    assert.ok(isExisted, "Provided socket wasn't found in store");
  }

  room(roomName: string) {
    return {
      add: (socket: WebSocket) => {
        const room = this.#rooms.get(roomName);
        if (room) {
          room.add(socket);
        } else {
          this.#rooms.set(roomName, new Set([socket]));
        }
        return this.room(roomName);
      },
      emit: (event: CustomWebsocketEvent) => {
        const room = this.#rooms.get(roomName);
        const data = event.asString;
        room?.forEach((socket) => socket.send(data));
        return this.room(roomName);
      },
      hasOneSocket: this.#rooms.get(roomName)?.size === 1,
      isEmpty: this.#rooms.get(roomName)?.size === 0,
      remove: (socket: WebSocket) => {
        const room = this.#rooms.get(roomName);
        const isExisted = room?.delete(socket);
        assert.ok(
          isExisted,
          `Provided socket wasn't found in room ${roomName}`,
        );
        return this.room(roomName);
      },
    };
  }
}
