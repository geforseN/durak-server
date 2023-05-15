import Defender from "../Players/Defender";
import { GameMove } from "./GameMove";

export class DefenderMove extends GameMove<Defender> {
  get defaultBehaviour(): NodeJS.Timeout {
    // тут нужно запрограммировать что-то одно
    // - сразу засчитать защитника проигравшим
    // - самим найти нужную карту, которую нужно отбить
    // NOTE: важно не засчитать защитника проигравшим,
    //       IF стол защищён (иначе защитнику будет обидно :-( )
    return setTimeout(() => {

    });
  }
}