import type { Suit } from "@durak-game/durak-dts";
import Card from "../../Card/index.js";
import { TrumpCard } from "../../Card/TrumpCard.js";
import crypto from "node:crypto";
import assert from "node:assert";

export function buildTalon(cardCount: number) {
  // cardCount probably equal to 24, 36 or 52
  // but later 54 can be added (where 2 additional cards are jokers)
  // assert below will throw if maxCardsPerSuit is float number
  const maxCardsPerSuit = cardCount / Card.suits.length;
  assert.ok(Number.isInteger(maxCardsPerSuit));
  return Card.suits
    .flatMap(
      // NOTE - get non shuffled deck
      (suit) => getCardOfSuit(suit, maxCardsPerSuit),
    )
    .reduce(
      // NOTE - get shuffled deck, where most bottom card suit will be trump suit
      makeCardsShuffle,
      Array<Card>(),
    )
    .map(
      // NOTE - make card with trump suit TrumpCard, otherwise return same card
      (card, _, cards) =>
        card.suit === cards[0].suit ? new TrumpCard(card) : card,
    );
}

function getCardOfSuit(suit: Suit, maxCardsPerSuit: number) {
  return [...Card.ranks]
    .reverse()
    .filter((_, index) => index < maxCardsPerSuit)
    .map((rank) => new Card({ rank, suit }));
}

// FIXME better shuffle cards, use index and cards for it instead of just card
function makeCardsShuffle(
  shuffledCards: Card[],
  card: Card,
) {
  if (crypto.randomInt(10) > 4) {
    shuffledCards.push(card);
  } else {
    shuffledCards.unshift(card);
  }
  return shuffledCards;
}
