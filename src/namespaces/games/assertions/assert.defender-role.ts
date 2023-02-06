import { CardPlayerRole } from "../../../durak-game/entity/card-player";

export default function assertDefenderRole(role: CardPlayerRole): asserts role is "DEFENDER" {
  if (role !== "DEFENDER") throw new Error("Вы не можете защищаться");
}