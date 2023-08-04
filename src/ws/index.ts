import WebSocket from "ws";
import assert from "node:assert";

function wsHelpersModule() {
  function __sendToSocket<EventName extends string>(
    this: { socket: WebSocket },
    eventName: EventName,
    ...payload: any[]
  ) {
    this.socket.send(JSON.stringify({ eventName, payload }));
  }

  function __sendToEverySocket<EventName extends string>(
    this: { sockets: WebSocket[] },
    eventName: EventName,
    ...payload: any[]
  ) {
    const message = JSON.stringify({ eventName, payload });
    this.sockets.forEach((socket) => socket.send(message));
  }

  function emitSocketOnce(socket: WebSocket) {
    socket.once("socketOnce", __sendToSocket.bind({ socket }));
  }

  function emitSocketOn(socket: WebSocket) {
    socket.on("socket", __sendToSocket.bind({ socket }));
  }

  function emitEverySocketOn(
    socket: WebSocket,
    sockets: WebSocket[],
  ) {
    socket.on("everySocket", __sendToEverySocket.bind({ sockets }));
  }

  function dispatchMessageToCertainListener(socket: WebSocket) {
    socket.onmessage = function (event) {
      assert.ok(typeof event.data === "string");
      const parsedData = JSON.parse(event.data);
      assert.ok(typeof parsedData === "object" && parsedData !== null);
      const { eventName, payload } = parsedData;
      assert.ok(typeof eventName === "string");
      assert.ok(typeof payload === "object" && payload !== null);
      this.emit(eventName, payload);
    };
  }

  function addUserSocketInRoom<UserSockets extends Map<string, Set<WebSocket>>>(
    this: { userSockets: UserSockets },
    socket: WebSocket,
    userId?: string,
  ) {
    if (!userId) return;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set([socket]));
    } else {
      this.userSockets.get(userId)?.add(socket);
    }
  }

  return {
    emitSocketOnce,
    emitSocketOn,
    emitEverySocketOn,
    dispatchMessageToCertainListener,
    addUserSocketInRoom,
  };
}

export const {
  emitSocketOn,
  emitSocketOnce,
  emitEverySocketOn,
  dispatchMessageToCertainListener,
  addUserSocketInRoom,
} = wsHelpersModule();

export class WebsocketEvent {
  constructor(public eventName: string) {}

  get asString() {
    return JSON.stringify({
      eventName: this.eventName,
      payload: { ...this, eventName: undefined },
    });
  }
}
