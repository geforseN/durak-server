import GameMove, {
  type CanCommandNextMove,
  type CardInsert,
} from "./GameMove.abstract";
import InsertAttackCardMove from "./InsertAttackCardMove";
import InsertDefendCardMove from "./InsertDefendCardMove";
import StopAttackMove from "./StopAttackMove";
import StopDefenseMove from "./StopDefenseMove";
import DefenderTransferMove from "./DefenderTransferMove";

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
