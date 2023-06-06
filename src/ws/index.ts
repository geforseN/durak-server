import { SocketStream } from "@fastify/websocket";
import WebSocket from "ws";
import assert from "node:assert";
import { FastifyRequest } from "fastify";

export function emitSocketOnce<EventName extends string>(socket: WebSocket) {
  socket.once("socketOnce", sendToSocket.bind({ socket }));
}

export function emitSocketOn<EventName extends string>(socket: WebSocket) {
  socket.on("socket", sendToSocket.bind({ socket }));
}

export function emitEverySocketOn<EventName extends string>(socket: WebSocket, sockets: WebSocket[]) {
  socket.on("everySocket", sendToEverySocket.bind({ sockets }));
}

export function dispatchMessageToCertainListener(connection: SocketStream) {
  connection.socket.onmessage = (event) => {
    assert.ok(typeof event.data === "string");
    const { eventName, payload } = JSON.parse(event.data);
    assert.ok(typeof eventName === "string");
    assert.ok(Array.isArray(payload));
    connection.socket.emit(eventName, ...payload);
  };
}

export function addUserSocketInRoom<
  UserSockets extends Map<string, any>
>(request: FastifyRequest, connection: SocketStream, userSockets: UserSockets) {
  const { userId } = request.session.userProfile;
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set([connection.socket]));
  } else {
    userSockets.get(userId)?.add(connection.socket);
  }
}

function sendToSocket<EventName extends string>(
  this: { socket: WebSocket },
  eventName: EventName,
  ...payload: any[]
) {
  this.socket.send(JSON.stringify({ eventName, payload }));
}

function sendToEverySocket<EventName extends string>(
  this: { sockets: WebSocket[] },
  eventName: EventName,
  ...payload: any[]
) {
  const message = JSON.stringify({ eventName, payload });
  this.sockets.forEach((socket) => socket.send(message));
}