// import { PlayerKind } from "@durak-game/durak-dts";
// import type Card from "../Card";
// import type DeskSlot from "../DeskSlot";
// import type { GameMove } from "../GameMove";
// import type { AllowedAttacker } from "./AllowedAttacker";
// import type { AllowedDefender } from "./AllowedDefender";
// import type Defender from "./Defender";
// import type Attacker from "./Attacker";
// import SuperPlayer from "./SuperPlayer";
// import { CanReceiveCards } from "../../DurakGame";
// import { Player } from "./Player";

// export { Player } from "./Player";
// export { Attacker } from "./Attacker";
// export { Defender } from "./Defender";
// export { Players } from "../Players/Players";
// export { SuperPlayer } from "./SuperPlayer";

// export interface CanMakeSuperMove {
//   makeInsertMove(
//     card: Card,
//     slot: DeskSlot,
//   ): Promise<GameMove<AllowedAttacker | AllowedDefender>>;
//   makeStopMove(): GameMove<AllowedAttacker | AllowedDefender>;
// }

// export interface CanMakeTransferMove {
//   canMakeTransferMove(card: Card, slot: DeskSlot): Promise<boolean>;
//   makeTransferMove(
//     card: Card,
//     slot: DeskSlot,
//   ): GameMove<AllowedAttacker | AllowedDefender>;
// }

// export interface CanGiveUp {
//   makeGiveUp(): GameMove<AllowedDefender>;
// }

// export interface IPlayer extends CanReceiveCards {
//   get id(): string;
//   get kind(): PlayerKind;
//   get $kind(): PlayerKind | "AllowedAttacker" | "AllowedDefender";

//   isDefender(): this is Defender;
//   isAttacker(): this is Attacker;
//   isSuperPlayer(): this is SuperPlayer;
//   isAllowedToMove(): this is CanMakeSuperMove;

//   base: Player;
// }

// export interface CanBeAllowedAgain {
//   asAllowedAgain(): CanMakeSuperMove;
// }
