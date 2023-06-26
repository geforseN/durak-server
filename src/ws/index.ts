import WebSocket from "ws";
import assert from "node:assert";


function wsHelpersModule() {
  function __sendToSocket__<EventName extends string>(
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

  function emitSocketOnce<EventName extends string>(socket: WebSocket) {
    socket.once("socketOnce", __sendToSocket__.bind({ socket }));
  }

  function emitSocketOn<EventName extends string>(socket: WebSocket) {
    socket.on("socket", __sendToSocket__.bind({ socket }));
  }

  function emitEverySocketOn<EventName extends string>(socket: WebSocket, sockets: WebSocket[]) {
    socket.on("everySocket", __sendToEverySocket.bind({ sockets }));
  }

  function dispatchMessageToCertainListener(socket: WebSocket) {
    socket.onmessage = function(event) {
      assert.ok(typeof event.data === "string");
      const { eventName, payload } = JSON.parse(event.data);
      assert.ok(typeof eventName === "string");
      assert.ok(typeof payload === "object" && payload !== null);
      this.emit(eventName, payload);
    };
  }

  function addUserSocketInRoom<UserSockets extends Map<string, Set<WebSocket>>>(
    this: { userSockets: UserSockets },
    socket: WebSocket, userId?: string,
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