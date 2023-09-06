import { Player } from "./index";

export default class OrderedPlayerEnemies {
  value: Player[];

  constructor(player: Player) {
    this.value = [];
    let enemy = player.left;
    while (enemy.id !== player.id) {
      this.value.push(enemy);
      enemy = enemy.left;
    }
  }
}
