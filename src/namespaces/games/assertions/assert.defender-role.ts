import { CardPlayerRole } from "../../../durak-game/entity/Players/Player";
// TODO 
export default function assertDefenderRole(role: CardPlayerRole): asserts role is "DEFENDER" {
  if (role !== "DEFENDER") throw new Error("Вы не можете защищаться");
}