import GameMove, {
  type CanCommandNextMove,
  type CardInsert,
} from "./GameMove.abstract.js";
import InsertAttackCardMove from "./InsertAttackCardMove.js";
import InsertDefendCardMove from "./InsertDefendCardMove.js";
import StopAttackMove from "./StopAttackMove.js";
import StopDefenseMove from "./StopDefenseMove.js";
import DefenderTransferMove from "./DefenderTransferMove.js";

export {
  type CanCommandNextMove,
  type CardInsert,
  GameMove,
  InsertAttackCardMove,
  InsertDefendCardMove,
  StopAttackMove,
  StopDefenseMove,
  DefenderTransferMove,
};
