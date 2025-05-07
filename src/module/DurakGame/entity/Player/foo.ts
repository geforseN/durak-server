interface PlayerCards {
  count: number;
}

interface Player {
  id: string;
}

class UnlinkedPlayer implements Player {}

class PassivePlayer implements Player {}

class WaitingDefender implements Player {}

class AllowedDefender implements Player {
  giveUp() {}

  makeMove() {}
}

class WaitingAttacker implements Player {}

class AllowedAttacker implements Player {
  stopAttack() {}

  makeMove() {}
}

class AttackerFromDefender implements Player {}

class AttackerFromPassive implements Player {}

class DefenderFromPassive implements Player {}

class DefenderFromAttacker implements Player {}

class EndedRoundPlayer implements Player {
  /* can receive cards */
}

class FailedDefender implements Player {
  /* can receive cards */
}
