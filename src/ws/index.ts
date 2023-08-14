import type WebSocket from "ws";
import assert from "node:assert";
import NotificationAlert from "../module/notification-alert";

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
  #value: Set<WebSocket>;
  #userSockets: Map<string, Set<WebSocket>>;

  constructor() {
    this.#value = new Set<WebSocket>();
    this.emitSockets = this.emitSockets.bind(this);
    this.#userSockets = new Map<string, Set<WebSocket>>();
  }

  emitSockets(event: CustomWebsocketEvent) {
    const data = event.asString;
    this.#value.forEach((socket) => socket.send(data));
  }

  add(socket: WebSocket) {
    this.#value.add(socket);
  }

  room(roomName: string) {
    if (!roomName) return { add: () => {} };
    return {
      add: (socket: WebSocket) => {
        const room = this.#userSockets.get(roomName);
        if (room) {
          room.add(socket);
        } else {
          this.#userSockets.set(roomName, new Set([socket]));
        }
      },
    };
  }

  delete(socket: WebSocket) {
    const isExisted = this.#value.delete(socket);
    assert.ok(isExisted, "Provided socket wasn't found in store");
  }
}
