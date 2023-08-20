import { PlayerKind, playerKinds } from "./Player";
export { default as Player, type AllowedMissingCardCount } from "./Player";
export { default as SuperPlayer } from "./SuperPlayer";
export { default as Attacker } from "./Attacker";
export { default as Defender } from "./Defender";
export { default as Players } from "./Players";
export type { playerKinds, PlayerKind };

export function isPlayerKind(kind: string | PlayerKind): kind is PlayerKind {
  return playerKinds.includes(kind as PlayerKind);
}
