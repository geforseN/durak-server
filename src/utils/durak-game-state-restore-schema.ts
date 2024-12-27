import { ranks, suits } from "@durak-game/durak-dts";
import {
  GameTypeSchema,
  UserProfileSchema,
} from "prisma/schema/generated/zod/index.js";
import { z } from "zod";

const NonNegativeIntegerSchema = z.number().int().nonnegative();

const PositiveIntegerSchema = z.number().int().positive();

const CardSchema = z.object({
  rank: z.enum(ranks),
  suit: z.enum(suits),
});

const PlayerKindSchema = z.enum([
  "Attacker",
  "Defender",
  "Player",
  "AllowedAttacker",
  "AllowedDefender",
  "SurrenderedDefender",
]);

const PlayerToJSONReturnSchema = z.object({
  id: z.string(),
  info: z.object({
    id: z.string(),
    profile: UserProfileSchema,
    isAdmin: z.boolean(),
  }),
  isAllowedToMove: z.boolean(),
  kind: PlayerKindSchema,
});

const GameRestoreStateEventPayloadSchema = z.object({
  desk: z.object({
    slots: z.array(
      z.object({
        index: NonNegativeIntegerSchema,
        attackCard: z.optional(CardSchema),
        defendCard: z.optional(CardSchema),
      }),
    ),
  }),
  discard: z.object({
    isEmpty: z.boolean(),
  }),
  enemies: z.array(
    PlayerToJSONReturnSchema.extend({
      cardCount: NonNegativeIntegerSchema,
    }),
  ),
  round: z.object({
    number: z.number().int().positive(),
  }),
  self: PlayerToJSONReturnSchema.extend({
    cards: CardSchema.array(),
  }),
  settings: z.object({
    players: z.object({
      count: PositiveIntegerSchema,
      moveTime: z.number(),
    }),
    type: z
      .string()
      .refine((str) => GameTypeSchema.safeParse(str.toUpperCase()).success),
    talon: z.object({
      count: PositiveIntegerSchema,
      trumpCard: CardSchema.optional(),
    }),
    initialDistribution: z.object({
      finalCardCount: PositiveIntegerSchema,
      cardCountPerIteration: PositiveIntegerSchema,
    }),
    desk: z.object({
      allowedFilledSlotCount: PositiveIntegerSchema,
      slotCount: PositiveIntegerSchema,
    }),
  }),
  status: z.string(/* TODO: remove it or add enum type */),
  talon: z.object({
    hasOneCard: z.boolean(),
    isEmpty: z.boolean(),
    trumpCard: CardSchema,
  }),
});


export type GameRestoreStateEventPayload = z.infer<typeof GameRestoreStateEventPayloadSchema>;

export const GameRestoreStateEventSchema = z.object({
  event: z.literal("game::state::restore"),
  payload: GameRestoreStateEventPayloadSchema,
});
