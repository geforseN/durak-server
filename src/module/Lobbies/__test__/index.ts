import { describe, it } from "node:test";
import Lobbies from "../entity/Lobbies";
import { SocketsStore } from "../../../ws";

describe("gameLobbies", (_suiteContext) => {
  const lobbies = new Lobbies(new SocketsStore());
  // TODO use something like https://github.com/thoov/mock-socket
  it.todo("show pass", (_testContext) => {});
  it.todo("toJSON return object with keys === ['id', 'settings', 'slots']");
});