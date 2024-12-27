import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserGameStatScalarFieldEnumSchema = z.enum(['userId','wonGamesCount','lostGamesCount','unstableGamesCount','createdAt']);

export const UserGamePlayerScalarFieldEnumSchema = z.enum(['index','hasLost','durakGameNumber','userId','result','place','roundLeftNumber']);

export const DurakGameScalarFieldEnumSchema = z.enum(['number','uuid','playersCount','status','cardCount','gameType','moveTime','createdAt']);

export const SessionScalarFieldEnumSchema = z.enum(['id','sid','data','expiresAt']);

export const UserScalarFieldEnumSchema = z.enum(['num','id','email','currentGameId','createdAt','updatedAt']);

export const UserProfileScalarFieldEnumSchema = z.enum(['userId','personalLink','updatedAt','photoUrl','nickname','connectStatus']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const GameStatusSchema = z.enum(['START_WAITING','STARTED','ENDED']);

export type GameStatusType = `${z.infer<typeof GameStatusSchema>}`

export const GameTypeSchema = z.enum(['BASIC','PEREVODNOY']);

export type GameTypeType = `${z.infer<typeof GameTypeSchema>}`

export const GameEndResultSchema = z.enum(['WON','LOST']);

export type GameEndResultType = `${z.infer<typeof GameEndResultSchema>}`

export const ConnectStatusSchema = z.enum(['ONLINE','AWAY','OFFLINE']);

export type ConnectStatusType = `${z.infer<typeof ConnectStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER GAME STAT SCHEMA
/////////////////////////////////////////

export const UserGameStatSchema = z.object({
  userId: z.string(),
  wonGamesCount: z.number().int(),
  lostGamesCount: z.number().int(),
  unstableGamesCount: z.number().int(),
  createdAt: z.coerce.date(),
})

export type UserGameStat = z.infer<typeof UserGameStatSchema>

/////////////////////////////////////////
// USER GAME PLAYER SCHEMA
/////////////////////////////////////////

export const UserGamePlayerSchema = z.object({
  result: GameEndResultSchema,
  index: z.number().int(),
  hasLost: z.boolean(),
  durakGameNumber: z.number().int(),
  userId: z.string(),
  place: z.number().int(),
  roundLeftNumber: z.number().int(),
})

export type UserGamePlayer = z.infer<typeof UserGamePlayerSchema>

/////////////////////////////////////////
// DURAK GAME SCHEMA
/////////////////////////////////////////

export const DurakGameSchema = z.object({
  status: GameStatusSchema,
  gameType: GameTypeSchema,
  number: z.number().int(),
  uuid: z.string(),
  playersCount: z.number().int(),
  cardCount: z.number().int(),
  moveTime: z.number(),
  createdAt: z.coerce.date(),
})

export type DurakGame = z.infer<typeof DurakGameSchema>

/////////////////////////////////////////
// SESSION SCHEMA
/////////////////////////////////////////

export const SessionSchema = z.object({
  id: z.string(),
  sid: z.string(),
  data: z.string(),
  expiresAt: z.coerce.date(),
})

export type Session = z.infer<typeof SessionSchema>

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  num: z.number().int(),
  id: z.string().uuid(),
  email: z.string().nullable(),
  currentGameId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER PROFILE SCHEMA
/////////////////////////////////////////

export const UserProfileSchema = z.object({
  connectStatus: ConnectStatusSchema,
  userId: z.string(),
  personalLink: z.string().cuid(),
  updatedAt: z.coerce.date(),
  photoUrl: z.string().nullable(),
  nickname: z.string(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER GAME STAT
//------------------------------------------------------

export const UserGameStatIncludeSchema: z.ZodType<Prisma.UserGameStatInclude> = z.object({
  UserGamePlayer: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserGameStatCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserGameStatArgsSchema: z.ZodType<Prisma.UserGameStatDefaultArgs> = z.object({
  select: z.lazy(() => UserGameStatSelectSchema).optional(),
  include: z.lazy(() => UserGameStatIncludeSchema).optional(),
}).strict();

export const UserGameStatCountOutputTypeArgsSchema: z.ZodType<Prisma.UserGameStatCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserGameStatCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserGameStatCountOutputTypeSelectSchema: z.ZodType<Prisma.UserGameStatCountOutputTypeSelect> = z.object({
  UserGamePlayer: z.boolean().optional(),
}).strict();

export const UserGameStatSelectSchema: z.ZodType<Prisma.UserGameStatSelect> = z.object({
  userId: z.boolean().optional(),
  wonGamesCount: z.boolean().optional(),
  lostGamesCount: z.boolean().optional(),
  unstableGamesCount: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  UserGamePlayer: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserGameStatCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER GAME PLAYER
//------------------------------------------------------

export const UserGamePlayerIncludeSchema: z.ZodType<Prisma.UserGamePlayerInclude> = z.object({
  DurakGame: z.union([z.boolean(),z.lazy(() => DurakGameArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  UserGameStat: z.union([z.boolean(),z.lazy(() => UserGameStatArgsSchema)]).optional(),
}).strict()

export const UserGamePlayerArgsSchema: z.ZodType<Prisma.UserGamePlayerDefaultArgs> = z.object({
  select: z.lazy(() => UserGamePlayerSelectSchema).optional(),
  include: z.lazy(() => UserGamePlayerIncludeSchema).optional(),
}).strict();

export const UserGamePlayerSelectSchema: z.ZodType<Prisma.UserGamePlayerSelect> = z.object({
  index: z.boolean().optional(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.boolean().optional(),
  userId: z.boolean().optional(),
  result: z.boolean().optional(),
  place: z.boolean().optional(),
  roundLeftNumber: z.boolean().optional(),
  DurakGame: z.union([z.boolean(),z.lazy(() => DurakGameArgsSchema)]).optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  UserGameStat: z.union([z.boolean(),z.lazy(() => UserGameStatArgsSchema)]).optional(),
}).strict()

// DURAK GAME
//------------------------------------------------------

export const DurakGameIncludeSchema: z.ZodType<Prisma.DurakGameInclude> = z.object({
  players: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DurakGameCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const DurakGameArgsSchema: z.ZodType<Prisma.DurakGameDefaultArgs> = z.object({
  select: z.lazy(() => DurakGameSelectSchema).optional(),
  include: z.lazy(() => DurakGameIncludeSchema).optional(),
}).strict();

export const DurakGameCountOutputTypeArgsSchema: z.ZodType<Prisma.DurakGameCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => DurakGameCountOutputTypeSelectSchema).nullish(),
}).strict();

export const DurakGameCountOutputTypeSelectSchema: z.ZodType<Prisma.DurakGameCountOutputTypeSelect> = z.object({
  players: z.boolean().optional(),
}).strict();

export const DurakGameSelectSchema: z.ZodType<Prisma.DurakGameSelect> = z.object({
  number: z.boolean().optional(),
  uuid: z.boolean().optional(),
  playersCount: z.boolean().optional(),
  status: z.boolean().optional(),
  cardCount: z.boolean().optional(),
  gameType: z.boolean().optional(),
  moveTime: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  players: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => DurakGameCountOutputTypeArgsSchema)]).optional(),
}).strict()

// SESSION
//------------------------------------------------------

export const SessionSelectSchema: z.ZodType<Prisma.SessionSelect> = z.object({
  id: z.boolean().optional(),
  sid: z.boolean().optional(),
  data: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
}).strict()

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z.object({
  UserGamePlayer: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  UserGameStat: z.union([z.boolean(),z.lazy(() => UserGameStatArgsSchema)]).optional(),
  UserProfile: z.union([z.boolean(),z.lazy(() => UserProfileArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z.object({
  select: z.lazy(() => UserSelectSchema).optional(),
  include: z.lazy(() => UserIncludeSchema).optional(),
}).strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z.object({
  UserGamePlayer: z.boolean().optional(),
}).strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z.object({
  num: z.boolean().optional(),
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  currentGameId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  UserGamePlayer: z.union([z.boolean(),z.lazy(() => UserGamePlayerFindManyArgsSchema)]).optional(),
  UserGameStat: z.union([z.boolean(),z.lazy(() => UserGameStatArgsSchema)]).optional(),
  UserProfile: z.union([z.boolean(),z.lazy(() => UserProfileArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
}).strict()

// USER PROFILE
//------------------------------------------------------

export const UserProfileIncludeSchema: z.ZodType<Prisma.UserProfileInclude> = z.object({
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const UserProfileArgsSchema: z.ZodType<Prisma.UserProfileDefaultArgs> = z.object({
  select: z.lazy(() => UserProfileSelectSchema).optional(),
  include: z.lazy(() => UserProfileIncludeSchema).optional(),
}).strict();

export const UserProfileSelectSchema: z.ZodType<Prisma.UserProfileSelect> = z.object({
  userId: z.boolean().optional(),
  personalLink: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  photoUrl: z.boolean().optional(),
  nickname: z.boolean().optional(),
  connectStatus: z.boolean().optional(),
  User: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserGameStatWhereInputSchema: z.ZodType<Prisma.UserGameStatWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserGameStatWhereInputSchema),z.lazy(() => UserGameStatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGameStatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGameStatWhereInputSchema),z.lazy(() => UserGameStatWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  wonGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  lostGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  unstableGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserGameStatOrderByWithRelationInputSchema: z.ZodType<Prisma.UserGameStatOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerOrderByRelationAggregateInputSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserGameStatWhereUniqueInputSchema: z.ZodType<Prisma.UserGameStatWhereUniqueInput> = z.object({
  userId: z.string()
})
.and(z.object({
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => UserGameStatWhereInputSchema),z.lazy(() => UserGameStatWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGameStatWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGameStatWhereInputSchema),z.lazy(() => UserGameStatWhereInputSchema).array() ]).optional(),
  wonGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  lostGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  unstableGamesCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserGameStatOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserGameStatOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserGameStatCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserGameStatAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserGameStatMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserGameStatMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserGameStatSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserGameStatScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserGameStatScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserGameStatScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGameStatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGameStatScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGameStatScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGameStatScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  wonGamesCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  lostGamesCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  unstableGamesCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserGamePlayerWhereInputSchema: z.ZodType<Prisma.UserGamePlayerWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserGamePlayerWhereInputSchema),z.lazy(() => UserGamePlayerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGamePlayerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGamePlayerWhereInputSchema),z.lazy(() => UserGamePlayerWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  hasLost: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  durakGameNumber: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => EnumGameEndResultFilterSchema),z.lazy(() => GameEndResultSchema) ]).optional(),
  place: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  roundLeftNumber: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  DurakGame: z.union([ z.lazy(() => DurakGameScalarRelationFilterSchema),z.lazy(() => DurakGameWhereInputSchema) ]).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  UserGameStat: z.union([ z.lazy(() => UserGameStatScalarRelationFilterSchema),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerOrderByWithRelationInputSchema: z.ZodType<Prisma.UserGamePlayerOrderByWithRelationInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  hasLost: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional(),
  DurakGame: z.lazy(() => DurakGameOrderByWithRelationInputSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatOrderByWithRelationInputSchema).optional()
}).strict();

export const UserGamePlayerWhereUniqueInputSchema: z.ZodType<Prisma.UserGamePlayerWhereUniqueInput> = z.object({
  durakGameNumber_index: z.lazy(() => UserGamePlayerDurakGameNumberIndexCompoundUniqueInputSchema)
})
.and(z.object({
  durakGameNumber_index: z.lazy(() => UserGamePlayerDurakGameNumberIndexCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => UserGamePlayerWhereInputSchema),z.lazy(() => UserGamePlayerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGamePlayerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGamePlayerWhereInputSchema),z.lazy(() => UserGamePlayerWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  hasLost: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  durakGameNumber: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => EnumGameEndResultFilterSchema),z.lazy(() => GameEndResultSchema) ]).optional(),
  place: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  roundLeftNumber: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  DurakGame: z.union([ z.lazy(() => DurakGameScalarRelationFilterSchema),z.lazy(() => DurakGameWhereInputSchema) ]).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  UserGameStat: z.union([ z.lazy(() => UserGameStatScalarRelationFilterSchema),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
}).strict());

export const UserGamePlayerOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserGamePlayerOrderByWithAggregationInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  hasLost: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserGamePlayerCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserGamePlayerAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserGamePlayerMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserGamePlayerMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserGamePlayerSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserGamePlayerScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserGamePlayerScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserGamePlayerScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGamePlayerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGamePlayerScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGamePlayerScalarWhereWithAggregatesInputSchema),z.lazy(() => UserGamePlayerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  hasLost: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  durakGameNumber: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => EnumGameEndResultWithAggregatesFilterSchema),z.lazy(() => GameEndResultSchema) ]).optional(),
  place: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  roundLeftNumber: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const DurakGameWhereInputSchema: z.ZodType<Prisma.DurakGameWhereInput> = z.object({
  AND: z.union([ z.lazy(() => DurakGameWhereInputSchema),z.lazy(() => DurakGameWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DurakGameWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DurakGameWhereInputSchema),z.lazy(() => DurakGameWhereInputSchema).array() ]).optional(),
  number: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  uuid: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  playersCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumGameStatusFilterSchema),z.lazy(() => GameStatusSchema) ]).optional(),
  cardCount: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  gameType: z.union([ z.lazy(() => EnumGameTypeFilterSchema),z.lazy(() => GameTypeSchema) ]).optional(),
  moveTime: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  players: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional()
}).strict();

export const DurakGameOrderByWithRelationInputSchema: z.ZodType<Prisma.DurakGameOrderByWithRelationInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  gameType: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  players: z.lazy(() => UserGamePlayerOrderByRelationAggregateInputSchema).optional()
}).strict();

export const DurakGameWhereUniqueInputSchema: z.ZodType<Prisma.DurakGameWhereUniqueInput> = z.object({
  number: z.number().int()
})
.and(z.object({
  number: z.number().int().optional(),
  AND: z.union([ z.lazy(() => DurakGameWhereInputSchema),z.lazy(() => DurakGameWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DurakGameWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DurakGameWhereInputSchema),z.lazy(() => DurakGameWhereInputSchema).array() ]).optional(),
  uuid: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  playersCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  status: z.union([ z.lazy(() => EnumGameStatusFilterSchema),z.lazy(() => GameStatusSchema) ]).optional(),
  cardCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  gameType: z.union([ z.lazy(() => EnumGameTypeFilterSchema),z.lazy(() => GameTypeSchema) ]).optional(),
  moveTime: z.union([ z.lazy(() => FloatFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  players: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional()
}).strict());

export const DurakGameOrderByWithAggregationInputSchema: z.ZodType<Prisma.DurakGameOrderByWithAggregationInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  gameType: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DurakGameCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DurakGameAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DurakGameMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DurakGameMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DurakGameSumOrderByAggregateInputSchema).optional()
}).strict();

export const DurakGameScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DurakGameScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => DurakGameScalarWhereWithAggregatesInputSchema),z.lazy(() => DurakGameScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DurakGameScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DurakGameScalarWhereWithAggregatesInputSchema),z.lazy(() => DurakGameScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  number: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  uuid: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  playersCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  status: z.union([ z.lazy(() => EnumGameStatusWithAggregatesFilterSchema),z.lazy(() => GameStatusSchema) ]).optional(),
  cardCount: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  gameType: z.union([ z.lazy(() => EnumGameTypeWithAggregatesFilterSchema),z.lazy(() => GameTypeSchema) ]).optional(),
  moveTime: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const SessionWhereInputSchema: z.ZodType<Prisma.SessionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sid: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  data: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const SessionOrderByWithRelationInputSchema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sid: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionWhereUniqueInputSchema: z.ZodType<Prisma.SessionWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    sid: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    sid: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  sid: z.string().optional(),
  AND: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionWhereInputSchema),z.lazy(() => SessionWhereInputSchema).array() ]).optional(),
  data: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict());

export const SessionOrderByWithAggregationInputSchema: z.ZodType<Prisma.SessionOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sid: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => SessionCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => SessionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => SessionMinOrderByAggregateInputSchema).optional()
}).strict();

export const SessionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.SessionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => SessionScalarWhereWithAggregatesInputSchema),z.lazy(() => SessionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  sid: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  data: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  num: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  currentGameId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional(),
  UserGameStat: z.union([ z.lazy(() => UserGameStatNullableScalarRelationFilterSchema),z.lazy(() => UserGameStatWhereInputSchema) ]).optional().nullable(),
  UserProfile: z.union([ z.lazy(() => UserProfileNullableScalarRelationFilterSchema),z.lazy(() => UserProfileWhereInputSchema) ]).optional().nullable(),
}).strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  currentGameId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerOrderByRelationAggregateInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatOrderByWithRelationInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileOrderByWithRelationInputSchema).optional()
}).strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    num: z.number().int(),
    email: z.string()
  }),
  z.object({
    id: z.string().uuid(),
    num: z.number().int(),
  }),
  z.object({
    id: z.string().uuid(),
    email: z.string(),
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    num: z.number().int(),
    email: z.string(),
  }),
  z.object({
    num: z.number().int(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserWhereInputSchema),z.lazy(() => UserWhereInputSchema).array() ]).optional(),
  currentGameId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerListRelationFilterSchema).optional(),
  UserGameStat: z.union([ z.lazy(() => UserGameStatNullableScalarRelationFilterSchema),z.lazy(() => UserGameStatWhereInputSchema) ]).optional().nullable(),
  UserProfile: z.union([ z.lazy(() => UserProfileNullableScalarRelationFilterSchema),z.lazy(() => UserProfileWhereInputSchema) ]).optional().nullable(),
}).strict());

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  currentGameId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UserAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UserSumOrderByAggregateInputSchema).optional()
}).strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserScalarWhereWithAggregatesInputSchema),z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  num: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  currentGameId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const UserProfileWhereInputSchema: z.ZodType<Prisma.UserProfileWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserProfileWhereInputSchema),z.lazy(() => UserProfileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserProfileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserProfileWhereInputSchema),z.lazy(() => UserProfileWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  personalLink: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  photoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nickname: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  connectStatus: z.union([ z.lazy(() => EnumConnectStatusFilterSchema),z.lazy(() => ConnectStatusSchema) ]).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export const UserProfileOrderByWithRelationInputSchema: z.ZodType<Prisma.UserProfileOrderByWithRelationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  personalLink: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  nickname: z.lazy(() => SortOrderSchema).optional(),
  connectStatus: z.lazy(() => SortOrderSchema).optional(),
  User: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export const UserProfileWhereUniqueInputSchema: z.ZodType<Prisma.UserProfileWhereUniqueInput> = z.union([
  z.object({
    userId: z.string(),
    personalLink: z.string().cuid()
  }),
  z.object({
    userId: z.string(),
  }),
  z.object({
    personalLink: z.string().cuid(),
  }),
])
.and(z.object({
  userId: z.string().optional(),
  personalLink: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => UserProfileWhereInputSchema),z.lazy(() => UserProfileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserProfileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserProfileWhereInputSchema),z.lazy(() => UserProfileWhereInputSchema).array() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  photoUrl: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  nickname: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  connectStatus: z.union([ z.lazy(() => EnumConnectStatusFilterSchema),z.lazy(() => ConnectStatusSchema) ]).optional(),
  User: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export const UserProfileOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserProfileOrderByWithAggregationInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  personalLink: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  nickname: z.lazy(() => SortOrderSchema).optional(),
  connectStatus: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UserProfileCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UserProfileMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UserProfileMinOrderByAggregateInputSchema).optional()
}).strict();

export const UserProfileScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserProfileScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => UserProfileScalarWhereWithAggregatesInputSchema),z.lazy(() => UserProfileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserProfileScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserProfileScalarWhereWithAggregatesInputSchema),z.lazy(() => UserProfileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  personalLink: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  photoUrl: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  nickname: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  connectStatus: z.union([ z.lazy(() => EnumConnectStatusWithAggregatesFilterSchema),z.lazy(() => ConnectStatusSchema) ]).optional(),
}).strict();

export const UserGameStatCreateInputSchema: z.ZodType<Prisma.UserGameStatCreateInput> = z.object({
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerCreateNestedManyWithoutUserGameStatInputSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserGameStatInputSchema)
}).strict();

export const UserGameStatUncheckedCreateInputSchema: z.ZodType<Prisma.UserGameStatUncheckedCreateInput> = z.object({
  userId: z.string(),
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutUserGameStatInputSchema).optional()
}).strict();

export const UserGameStatUpdateInputSchema: z.ZodType<Prisma.UserGameStatUpdateInput> = z.object({
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUpdateManyWithoutUserGameStatNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserGameStatNestedInputSchema).optional()
}).strict();

export const UserGameStatUncheckedUpdateInputSchema: z.ZodType<Prisma.UserGameStatUncheckedUpdateInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserGameStatNestedInputSchema).optional()
}).strict();

export const UserGameStatCreateManyInputSchema: z.ZodType<Prisma.UserGameStatCreateManyInput> = z.object({
  userId: z.string(),
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserGameStatUpdateManyMutationInputSchema: z.ZodType<Prisma.UserGameStatUpdateManyMutationInput> = z.object({
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGameStatUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserGameStatUncheckedUpdateManyInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateInputSchema: z.ZodType<Prisma.UserGamePlayerCreateInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int(),
  DurakGame: z.lazy(() => DurakGameCreateNestedOneWithoutPlayersInputSchema),
  User: z.lazy(() => UserCreateNestedOneWithoutUserGamePlayerInputSchema),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserGamePlayerInputSchema)
}).strict();

export const UserGamePlayerUncheckedCreateInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  userId: z.string(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerUpdateInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  DurakGame: z.lazy(() => DurakGameUpdateOneRequiredWithoutPlayersNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedUpdateInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateManyInputSchema: z.ZodType<Prisma.UserGamePlayerCreateManyInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  userId: z.string(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerUpdateManyMutationInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyMutationInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DurakGameCreateInputSchema: z.ZodType<Prisma.DurakGameCreateInput> = z.object({
  number: z.number().int().optional(),
  uuid: z.string(),
  playersCount: z.number().int(),
  status: z.lazy(() => GameStatusSchema).optional(),
  cardCount: z.number().int(),
  gameType: z.lazy(() => GameTypeSchema),
  moveTime: z.number(),
  createdAt: z.coerce.date().optional(),
  players: z.lazy(() => UserGamePlayerCreateNestedManyWithoutDurakGameInputSchema).optional()
}).strict();

export const DurakGameUncheckedCreateInputSchema: z.ZodType<Prisma.DurakGameUncheckedCreateInput> = z.object({
  number: z.number().int().optional(),
  uuid: z.string(),
  playersCount: z.number().int(),
  status: z.lazy(() => GameStatusSchema).optional(),
  cardCount: z.number().int(),
  gameType: z.lazy(() => GameTypeSchema),
  moveTime: z.number(),
  createdAt: z.coerce.date().optional(),
  players: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutDurakGameInputSchema).optional()
}).strict();

export const DurakGameUpdateInputSchema: z.ZodType<Prisma.DurakGameUpdateInput> = z.object({
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  players: z.lazy(() => UserGamePlayerUpdateManyWithoutDurakGameNestedInputSchema).optional()
}).strict();

export const DurakGameUncheckedUpdateInputSchema: z.ZodType<Prisma.DurakGameUncheckedUpdateInput> = z.object({
  number: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  players: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutDurakGameNestedInputSchema).optional()
}).strict();

export const DurakGameCreateManyInputSchema: z.ZodType<Prisma.DurakGameCreateManyInput> = z.object({
  number: z.number().int().optional(),
  uuid: z.string(),
  playersCount: z.number().int(),
  status: z.lazy(() => GameStatusSchema).optional(),
  cardCount: z.number().int(),
  gameType: z.lazy(() => GameTypeSchema),
  moveTime: z.number(),
  createdAt: z.coerce.date().optional()
}).strict();

export const DurakGameUpdateManyMutationInputSchema: z.ZodType<Prisma.DurakGameUpdateManyMutationInput> = z.object({
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DurakGameUncheckedUpdateManyInputSchema: z.ZodType<Prisma.DurakGameUncheckedUpdateManyInput> = z.object({
  number: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateInputSchema: z.ZodType<Prisma.SessionCreateInput> = z.object({
  id: z.string(),
  sid: z.string(),
  data: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUncheckedCreateInputSchema: z.ZodType<Prisma.SessionUncheckedCreateInput> = z.object({
  id: z.string(),
  sid: z.string(),
  data: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUpdateInputSchema: z.ZodType<Prisma.SessionUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionCreateManyInputSchema: z.ZodType<Prisma.SessionCreateManyInput> = z.object({
  id: z.string(),
  sid: z.string(),
  data: z.string(),
  expiresAt: z.coerce.date()
}).strict();

export const SessionUpdateManyMutationInputSchema: z.ZodType<Prisma.SessionUpdateManyMutationInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const SessionUncheckedUpdateManyInputSchema: z.ZodType<Prisma.SessionUncheckedUpdateManyInput> = z.object({
  id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  data: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  expiresAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerCreateNestedManyWithoutUserInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUpdateManyWithoutUserNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z.object({
  num: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z.object({
  num: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserProfileCreateInputSchema: z.ZodType<Prisma.UserProfileCreateInput> = z.object({
  personalLink: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  photoUrl: z.string().optional().nullable(),
  nickname: z.string().optional(),
  connectStatus: z.lazy(() => ConnectStatusSchema).optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserProfileInputSchema)
}).strict();

export const UserProfileUncheckedCreateInputSchema: z.ZodType<Prisma.UserProfileUncheckedCreateInput> = z.object({
  userId: z.string(),
  personalLink: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  photoUrl: z.string().optional().nullable(),
  nickname: z.string().optional(),
  connectStatus: z.lazy(() => ConnectStatusSchema).optional()
}).strict();

export const UserProfileUpdateInputSchema: z.ZodType<Prisma.UserProfileUpdateInput> = z.object({
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserProfileNestedInputSchema).optional()
}).strict();

export const UserProfileUncheckedUpdateInputSchema: z.ZodType<Prisma.UserProfileUncheckedUpdateInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserProfileCreateManyInputSchema: z.ZodType<Prisma.UserProfileCreateManyInput> = z.object({
  userId: z.string(),
  personalLink: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  photoUrl: z.string().optional().nullable(),
  nickname: z.string().optional(),
  connectStatus: z.lazy(() => ConnectStatusSchema).optional()
}).strict();

export const UserProfileUpdateManyMutationInputSchema: z.ZodType<Prisma.UserProfileUpdateManyMutationInput> = z.object({
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserProfileUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserProfileUncheckedUpdateManyInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const UserGamePlayerListRelationFilterSchema: z.ZodType<Prisma.UserGamePlayerListRelationFilter> = z.object({
  every: z.lazy(() => UserGamePlayerWhereInputSchema).optional(),
  some: z.lazy(() => UserGamePlayerWhereInputSchema).optional(),
  none: z.lazy(() => UserGamePlayerWhereInputSchema).optional()
}).strict();

export const UserScalarRelationFilterSchema: z.ZodType<Prisma.UserScalarRelationFilter> = z.object({
  is: z.lazy(() => UserWhereInputSchema).optional(),
  isNot: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserGamePlayerOrderByRelationAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGameStatCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserGameStatCountOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGameStatAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserGameStatAvgOrderByAggregateInput> = z.object({
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGameStatMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserGameStatMaxOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGameStatMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserGameStatMinOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGameStatSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserGameStatSumOrderByAggregateInput> = z.object({
  wonGamesCount: z.lazy(() => SortOrderSchema).optional(),
  lostGamesCount: z.lazy(() => SortOrderSchema).optional(),
  unstableGamesCount: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const EnumGameEndResultFilterSchema: z.ZodType<Prisma.EnumGameEndResultFilter> = z.object({
  equals: z.lazy(() => GameEndResultSchema).optional(),
  in: z.lazy(() => GameEndResultSchema).array().optional(),
  notIn: z.lazy(() => GameEndResultSchema).array().optional(),
  not: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => NestedEnumGameEndResultFilterSchema) ]).optional(),
}).strict();

export const DurakGameScalarRelationFilterSchema: z.ZodType<Prisma.DurakGameScalarRelationFilter> = z.object({
  is: z.lazy(() => DurakGameWhereInputSchema).optional(),
  isNot: z.lazy(() => DurakGameWhereInputSchema).optional()
}).strict();

export const UserGameStatScalarRelationFilterSchema: z.ZodType<Prisma.UserGameStatScalarRelationFilter> = z.object({
  is: z.lazy(() => UserGameStatWhereInputSchema).optional(),
  isNot: z.lazy(() => UserGameStatWhereInputSchema).optional()
}).strict();

export const UserGamePlayerDurakGameNumberIndexCompoundUniqueInputSchema: z.ZodType<Prisma.UserGamePlayerDurakGameNumberIndexCompoundUniqueInput> = z.object({
  durakGameNumber: z.number(),
  index: z.number()
}).strict();

export const UserGamePlayerCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerCountOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  hasLost: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGamePlayerAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerAvgOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGamePlayerMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerMaxOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  hasLost: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGamePlayerMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerMinOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  hasLost: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  result: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserGamePlayerSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserGamePlayerSumOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  durakGameNumber: z.lazy(() => SortOrderSchema).optional(),
  place: z.lazy(() => SortOrderSchema).optional(),
  roundLeftNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const EnumGameEndResultWithAggregatesFilterSchema: z.ZodType<Prisma.EnumGameEndResultWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameEndResultSchema).optional(),
  in: z.lazy(() => GameEndResultSchema).array().optional(),
  notIn: z.lazy(() => GameEndResultSchema).array().optional(),
  not: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => NestedEnumGameEndResultWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameEndResultFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameEndResultFilterSchema).optional()
}).strict();

export const EnumGameStatusFilterSchema: z.ZodType<Prisma.EnumGameStatusFilter> = z.object({
  equals: z.lazy(() => GameStatusSchema).optional(),
  in: z.lazy(() => GameStatusSchema).array().optional(),
  notIn: z.lazy(() => GameStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => NestedEnumGameStatusFilterSchema) ]).optional(),
}).strict();

export const EnumGameTypeFilterSchema: z.ZodType<Prisma.EnumGameTypeFilter> = z.object({
  equals: z.lazy(() => GameTypeSchema).optional(),
  in: z.lazy(() => GameTypeSchema).array().optional(),
  notIn: z.lazy(() => GameTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => NestedEnumGameTypeFilterSchema) ]).optional(),
}).strict();

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const DurakGameCountOrderByAggregateInputSchema: z.ZodType<Prisma.DurakGameCountOrderByAggregateInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  gameType: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DurakGameAvgOrderByAggregateInputSchema: z.ZodType<Prisma.DurakGameAvgOrderByAggregateInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DurakGameMaxOrderByAggregateInputSchema: z.ZodType<Prisma.DurakGameMaxOrderByAggregateInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  gameType: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DurakGameMinOrderByAggregateInputSchema: z.ZodType<Prisma.DurakGameMinOrderByAggregateInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  uuid: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  gameType: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const DurakGameSumOrderByAggregateInputSchema: z.ZodType<Prisma.DurakGameSumOrderByAggregateInput> = z.object({
  number: z.lazy(() => SortOrderSchema).optional(),
  playersCount: z.lazy(() => SortOrderSchema).optional(),
  cardCount: z.lazy(() => SortOrderSchema).optional(),
  moveTime: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumGameStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumGameStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameStatusSchema).optional(),
  in: z.lazy(() => GameStatusSchema).array().optional(),
  notIn: z.lazy(() => GameStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => NestedEnumGameStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameStatusFilterSchema).optional()
}).strict();

export const EnumGameTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumGameTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameTypeSchema).optional(),
  in: z.lazy(() => GameTypeSchema).array().optional(),
  notIn: z.lazy(() => GameTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => NestedEnumGameTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameTypeFilterSchema).optional()
}).strict();

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const SessionCountOrderByAggregateInputSchema: z.ZodType<Prisma.SessionCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sid: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sid: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const SessionMinOrderByAggregateInputSchema: z.ZodType<Prisma.SessionMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  sid: z.lazy(() => SortOrderSchema).optional(),
  data: z.lazy(() => SortOrderSchema).optional(),
  expiresAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const UserGameStatNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserGameStatNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => UserGameStatWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserGameStatWhereInputSchema).optional().nullable()
}).strict();

export const UserProfileNullableScalarRelationFilterSchema: z.ZodType<Prisma.UserProfileNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => UserProfileWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => UserProfileWhereInputSchema).optional().nullable()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentGameId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UserAvgOrderByAggregateInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentGameId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional(),
  id: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  currentGameId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserSumOrderByAggregateInputSchema: z.ZodType<Prisma.UserSumOrderByAggregateInput> = z.object({
  num: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const EnumConnectStatusFilterSchema: z.ZodType<Prisma.EnumConnectStatusFilter> = z.object({
  equals: z.lazy(() => ConnectStatusSchema).optional(),
  in: z.lazy(() => ConnectStatusSchema).array().optional(),
  notIn: z.lazy(() => ConnectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => NestedEnumConnectStatusFilterSchema) ]).optional(),
}).strict();

export const UserProfileCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserProfileCountOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  personalLink: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  nickname: z.lazy(() => SortOrderSchema).optional(),
  connectStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserProfileMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserProfileMaxOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  personalLink: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  nickname: z.lazy(() => SortOrderSchema).optional(),
  connectStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const UserProfileMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserProfileMinOrderByAggregateInput> = z.object({
  userId: z.lazy(() => SortOrderSchema).optional(),
  personalLink: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  photoUrl: z.lazy(() => SortOrderSchema).optional(),
  nickname: z.lazy(() => SortOrderSchema).optional(),
  connectStatus: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumConnectStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumConnectStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ConnectStatusSchema).optional(),
  in: z.lazy(() => ConnectStatusSchema).array().optional(),
  notIn: z.lazy(() => ConnectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => NestedEnumConnectStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumConnectStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumConnectStatusFilterSchema).optional()
}).strict();

export const UserGamePlayerCreateNestedManyWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerCreateNestedManyWithoutUserGameStatInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserGameStatInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserGameStatInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGameStatInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserGameStatInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedCreateNestedManyWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateNestedManyWithoutUserGameStatInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserGameStatInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const UserGamePlayerUpdateManyWithoutUserGameStatNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithoutUserGameStatNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserGameStatInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutUserGameStatNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserGameStatNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGameStatInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserGameStatInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserGameStatInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserGameStatInputSchema),z.lazy(() => UserUpdateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGameStatInputSchema) ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutUserGameStatNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutUserGameStatNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserGameStatInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const DurakGameCreateNestedOneWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameCreateNestedOneWithoutPlayersInput> = z.object({
  create: z.union([ z.lazy(() => DurakGameCreateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedCreateWithoutPlayersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DurakGameCreateOrConnectWithoutPlayersInputSchema).optional(),
  connect: z.lazy(() => DurakGameWhereUniqueInputSchema).optional()
}).strict();

export const UserCreateNestedOneWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserGamePlayerInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGamePlayerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserGamePlayerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const UserGameStatCreateNestedOneWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatCreateNestedOneWithoutUserGamePlayerInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserGamePlayerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserGamePlayerInputSchema).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const EnumGameEndResultFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumGameEndResultFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => GameEndResultSchema).optional()
}).strict();

export const DurakGameUpdateOneRequiredWithoutPlayersNestedInputSchema: z.ZodType<Prisma.DurakGameUpdateOneRequiredWithoutPlayersNestedInput> = z.object({
  create: z.union([ z.lazy(() => DurakGameCreateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedCreateWithoutPlayersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => DurakGameCreateOrConnectWithoutPlayersInputSchema).optional(),
  upsert: z.lazy(() => DurakGameUpsertWithoutPlayersInputSchema).optional(),
  connect: z.lazy(() => DurakGameWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => DurakGameUpdateToOneWithWhereWithoutPlayersInputSchema),z.lazy(() => DurakGameUpdateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedUpdateWithoutPlayersInputSchema) ]).optional(),
}).strict();

export const UserUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserGamePlayerNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGamePlayerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserGamePlayerInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserGamePlayerInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserGamePlayerInputSchema),z.lazy(() => UserUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGamePlayerInputSchema) ]).optional(),
}).strict();

export const UserGameStatUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema: z.ZodType<Prisma.UserGameStatUpdateOneRequiredWithoutUserGamePlayerNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserGamePlayerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserGamePlayerInputSchema).optional(),
  upsert: z.lazy(() => UserGameStatUpsertWithoutUserGamePlayerInputSchema).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserGameStatUpdateToOneWithWhereWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserGamePlayerInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateNestedManyWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerCreateNestedManyWithoutDurakGameInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyDurakGameInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGamePlayerUncheckedCreateNestedManyWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateNestedManyWithoutDurakGameInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyDurakGameInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumGameStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumGameStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => GameStatusSchema).optional()
}).strict();

export const EnumGameTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumGameTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => GameTypeSchema).optional()
}).strict();

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const UserGamePlayerUpdateManyWithoutDurakGameNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithoutDurakGameNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyDurakGameInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutDurakGameInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutDurakGameNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutDurakGameNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyDurakGameInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutDurakGameInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGamePlayerCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGameStatCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional()
}).strict();

export const UserProfileCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.UserProfileCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserProfileCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => UserProfileWhereUniqueInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const UserGameStatUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUncheckedCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional()
}).strict();

export const UserProfileUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUncheckedCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserProfileCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => UserProfileWhereUniqueInputSchema).optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const UserGamePlayerUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGameStatUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGameStatUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => UserGameStatUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserGameStatUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => UserGameStatUpdateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const UserProfileUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.UserProfileUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserProfileCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => UserProfileUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserProfileWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserProfileWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserProfileWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserProfileUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => UserProfileUpdateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema).array(),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema),z.lazy(() => UserGamePlayerCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => UserGamePlayerCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => UserGamePlayerWhereUniqueInputSchema),z.lazy(() => UserGamePlayerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => UserGamePlayerUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const UserGameStatUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.UserGameStatUncheckedUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserGameStatCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => UserGameStatUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserGameStatWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserGameStatWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserGameStatUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => UserGameStatUpdateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const UserProfileUncheckedUpdateOneWithoutUserNestedInputSchema: z.ZodType<Prisma.UserProfileUncheckedUpdateOneWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserProfileCreateOrConnectWithoutUserInputSchema).optional(),
  upsert: z.lazy(() => UserProfileUpsertWithoutUserInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => UserProfileWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => UserProfileWhereInputSchema) ]).optional(),
  connect: z.lazy(() => UserProfileWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserProfileUpdateToOneWithWhereWithoutUserInputSchema),z.lazy(() => UserProfileUpdateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedUpdateWithoutUserInputSchema) ]).optional(),
}).strict();

export const UserCreateNestedOneWithoutUserProfileInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutUserProfileInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserProfileInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserProfileInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional()
}).strict();

export const EnumConnectStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumConnectStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => ConnectStatusSchema).optional()
}).strict();

export const UserUpdateOneRequiredWithoutUserProfileNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutUserProfileNestedInput> = z.object({
  create: z.union([ z.lazy(() => UserCreateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserProfileInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutUserProfileInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutUserProfileInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutUserProfileInputSchema),z.lazy(() => UserUpdateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserProfileInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedEnumGameEndResultFilterSchema: z.ZodType<Prisma.NestedEnumGameEndResultFilter> = z.object({
  equals: z.lazy(() => GameEndResultSchema).optional(),
  in: z.lazy(() => GameEndResultSchema).array().optional(),
  notIn: z.lazy(() => GameEndResultSchema).array().optional(),
  not: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => NestedEnumGameEndResultFilterSchema) ]).optional(),
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedEnumGameEndResultWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumGameEndResultWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameEndResultSchema).optional(),
  in: z.lazy(() => GameEndResultSchema).array().optional(),
  notIn: z.lazy(() => GameEndResultSchema).array().optional(),
  not: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => NestedEnumGameEndResultWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameEndResultFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameEndResultFilterSchema).optional()
}).strict();

export const NestedEnumGameStatusFilterSchema: z.ZodType<Prisma.NestedEnumGameStatusFilter> = z.object({
  equals: z.lazy(() => GameStatusSchema).optional(),
  in: z.lazy(() => GameStatusSchema).array().optional(),
  notIn: z.lazy(() => GameStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => NestedEnumGameStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumGameTypeFilterSchema: z.ZodType<Prisma.NestedEnumGameTypeFilter> = z.object({
  equals: z.lazy(() => GameTypeSchema).optional(),
  in: z.lazy(() => GameTypeSchema).array().optional(),
  notIn: z.lazy(() => GameTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => NestedEnumGameTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumGameStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumGameStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameStatusSchema).optional(),
  in: z.lazy(() => GameStatusSchema).array().optional(),
  notIn: z.lazy(() => GameStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => NestedEnumGameStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameStatusFilterSchema).optional()
}).strict();

export const NestedEnumGameTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumGameTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => GameTypeSchema).optional(),
  in: z.lazy(() => GameTypeSchema).array().optional(),
  notIn: z.lazy(() => GameTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => NestedEnumGameTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumGameTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumGameTypeFilterSchema).optional()
}).strict();

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional()
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedEnumConnectStatusFilterSchema: z.ZodType<Prisma.NestedEnumConnectStatusFilter> = z.object({
  equals: z.lazy(() => ConnectStatusSchema).optional(),
  in: z.lazy(() => ConnectStatusSchema).array().optional(),
  notIn: z.lazy(() => ConnectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => NestedEnumConnectStatusFilterSchema) ]).optional(),
}).strict();

export const NestedEnumConnectStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumConnectStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ConnectStatusSchema).optional(),
  in: z.lazy(() => ConnectStatusSchema).array().optional(),
  notIn: z.lazy(() => ConnectStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => NestedEnumConnectStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumConnectStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumConnectStatusFilterSchema).optional()
}).strict();

export const UserGamePlayerCreateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerCreateWithoutUserGameStatInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int(),
  DurakGame: z.lazy(() => DurakGameCreateNestedOneWithoutPlayersInputSchema),
  User: z.lazy(() => UserCreateNestedOneWithoutUserGamePlayerInputSchema)
}).strict();

export const UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateWithoutUserGameStatInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerCreateOrConnectWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerCreateOrConnectWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserGamePlayerCreateManyUserGameStatInputEnvelopeSchema: z.ZodType<Prisma.UserGamePlayerCreateManyUserGameStatInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserGamePlayerCreateManyUserGameStatInputSchema),z.lazy(() => UserGamePlayerCreateManyUserGameStatInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserCreateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserCreateWithoutUserGameStatInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerCreateNestedManyWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserGameStatInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUpsertWithWhereUniqueWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutUserGameStatInputSchema) ]),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithWhereUniqueWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutUserGameStatInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithWhereWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserGamePlayerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateManyMutationInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserGamePlayerScalarWhereInputSchema: z.ZodType<Prisma.UserGamePlayerScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UserGamePlayerScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UserGamePlayerScalarWhereInputSchema),z.lazy(() => UserGamePlayerScalarWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  hasLost: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  durakGameNumber: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  result: z.union([ z.lazy(() => EnumGameEndResultFilterSchema),z.lazy(() => GameEndResultSchema) ]).optional(),
  place: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  roundLeftNumber: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const UserUpsertWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserGameStatInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGameStatInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGameStatInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserGameStatInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserGameStatInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGameStatInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserGameStatInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUpdateManyWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserGameStatInput> = z.object({
  num: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const DurakGameCreateWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameCreateWithoutPlayersInput> = z.object({
  number: z.number().int().optional(),
  uuid: z.string(),
  playersCount: z.number().int(),
  status: z.lazy(() => GameStatusSchema).optional(),
  cardCount: z.number().int(),
  gameType: z.lazy(() => GameTypeSchema),
  moveTime: z.number(),
  createdAt: z.coerce.date().optional()
}).strict();

export const DurakGameUncheckedCreateWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameUncheckedCreateWithoutPlayersInput> = z.object({
  number: z.number().int().optional(),
  uuid: z.string(),
  playersCount: z.number().int(),
  status: z.lazy(() => GameStatusSchema).optional(),
  cardCount: z.number().int(),
  gameType: z.lazy(() => GameTypeSchema),
  moveTime: z.number(),
  createdAt: z.coerce.date().optional()
}).strict();

export const DurakGameCreateOrConnectWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameCreateOrConnectWithoutPlayersInput> = z.object({
  where: z.lazy(() => DurakGameWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => DurakGameCreateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedCreateWithoutPlayersInputSchema) ]),
}).strict();

export const UserCreateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserCreateWithoutUserGamePlayerInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserGamePlayerInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedCreateNestedOneWithoutUserInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserGamePlayerInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGamePlayerInputSchema) ]),
}).strict();

export const UserGameStatCreateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatCreateWithoutUserGamePlayerInput> = z.object({
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserGameStatInputSchema)
}).strict();

export const UserGameStatUncheckedCreateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatUncheckedCreateWithoutUserGamePlayerInput> = z.object({
  userId: z.string(),
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional()
}).strict();

export const UserGameStatCreateOrConnectWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatCreateOrConnectWithoutUserGamePlayerInput> = z.object({
  where: z.lazy(() => UserGameStatWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserGamePlayerInputSchema) ]),
}).strict();

export const DurakGameUpsertWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameUpsertWithoutPlayersInput> = z.object({
  update: z.union([ z.lazy(() => DurakGameUpdateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedUpdateWithoutPlayersInputSchema) ]),
  create: z.union([ z.lazy(() => DurakGameCreateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedCreateWithoutPlayersInputSchema) ]),
  where: z.lazy(() => DurakGameWhereInputSchema).optional()
}).strict();

export const DurakGameUpdateToOneWithWhereWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameUpdateToOneWithWhereWithoutPlayersInput> = z.object({
  where: z.lazy(() => DurakGameWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => DurakGameUpdateWithoutPlayersInputSchema),z.lazy(() => DurakGameUncheckedUpdateWithoutPlayersInputSchema) ]),
}).strict();

export const DurakGameUpdateWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameUpdateWithoutPlayersInput> = z.object({
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const DurakGameUncheckedUpdateWithoutPlayersInputSchema: z.ZodType<Prisma.DurakGameUncheckedUpdateWithoutPlayersInput> = z.object({
  number: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  uuid: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  playersCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => GameStatusSchema),z.lazy(() => EnumGameStatusFieldUpdateOperationsInputSchema) ]).optional(),
  cardCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gameType: z.union([ z.lazy(() => GameTypeSchema),z.lazy(() => EnumGameTypeFieldUpdateOperationsInputSchema) ]).optional(),
  moveTime: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserUpsertWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserGamePlayerInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGamePlayerInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserGamePlayerInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserGamePlayerInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserGamePlayerInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserGamePlayerInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserGamePlayerInput> = z.object({
  num: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedUpdateOneWithoutUserNestedInputSchema).optional(),
  UserProfile: z.lazy(() => UserProfileUncheckedUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserGameStatUpsertWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatUpsertWithoutUserGamePlayerInput> = z.object({
  update: z.union([ z.lazy(() => UserGameStatUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserGamePlayerInputSchema) ]),
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserGamePlayerInputSchema) ]),
  where: z.lazy(() => UserGameStatWhereInputSchema).optional()
}).strict();

export const UserGameStatUpdateToOneWithWhereWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatUpdateToOneWithWhereWithoutUserGamePlayerInput> = z.object({
  where: z.lazy(() => UserGameStatWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserGameStatUpdateWithoutUserGamePlayerInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserGamePlayerInputSchema) ]),
}).strict();

export const UserGameStatUpdateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatUpdateWithoutUserGamePlayerInput> = z.object({
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserGameStatNestedInputSchema).optional()
}).strict();

export const UserGameStatUncheckedUpdateWithoutUserGamePlayerInputSchema: z.ZodType<Prisma.UserGameStatUncheckedUpdateWithoutUserGamePlayerInput> = z.object({
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerCreateWithoutDurakGameInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int(),
  User: z.lazy(() => UserCreateNestedOneWithoutUserGamePlayerInputSchema),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserGamePlayerInputSchema)
}).strict();

export const UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateWithoutDurakGameInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  userId: z.string(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerCreateOrConnectWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerCreateOrConnectWithoutDurakGameInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema) ]),
}).strict();

export const UserGamePlayerCreateManyDurakGameInputEnvelopeSchema: z.ZodType<Prisma.UserGamePlayerCreateManyDurakGameInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserGamePlayerCreateManyDurakGameInputSchema),z.lazy(() => UserGamePlayerCreateManyDurakGameInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUpsertWithWhereUniqueWithoutDurakGameInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutDurakGameInputSchema) ]),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutDurakGameInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithWhereUniqueWithoutDurakGameInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutDurakGameInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutDurakGameInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateManyWithWhereWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithWhereWithoutDurakGameInput> = z.object({
  where: z.lazy(() => UserGamePlayerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateManyMutationInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutDurakGameInputSchema) ]),
}).strict();

export const UserGamePlayerCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerCreateWithoutUserInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int(),
  DurakGame: z.lazy(() => DurakGameCreateNestedOneWithoutPlayersInputSchema),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserGamePlayerInputSchema)
}).strict();

export const UserGamePlayerUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedCreateWithoutUserInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserGamePlayerCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.UserGamePlayerCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => UserGamePlayerCreateManyUserInputSchema),z.lazy(() => UserGamePlayerCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const UserGameStatCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatCreateWithoutUserInput> = z.object({
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerCreateNestedManyWithoutUserGameStatInputSchema).optional()
}).strict();

export const UserGameStatUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUncheckedCreateWithoutUserInput> = z.object({
  wonGamesCount: z.number().int().optional(),
  lostGamesCount: z.number().int().optional(),
  unstableGamesCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutUserGameStatInputSchema).optional()
}).strict();

export const UserGameStatCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserGameStatWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserProfileCreateWithoutUserInputSchema: z.ZodType<Prisma.UserProfileCreateWithoutUserInput> = z.object({
  personalLink: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  photoUrl: z.string().optional().nullable(),
  nickname: z.string().optional(),
  connectStatus: z.lazy(() => ConnectStatusSchema).optional()
}).strict();

export const UserProfileUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUncheckedCreateWithoutUserInput> = z.object({
  personalLink: z.string().cuid().optional(),
  updatedAt: z.coerce.date().optional(),
  photoUrl: z.string().optional().nullable(),
  nickname: z.string().optional(),
  connectStatus: z.lazy(() => ConnectStatusSchema).optional()
}).strict();

export const UserProfileCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.UserProfileCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => UserProfileWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserGamePlayerUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserGamePlayerCreateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => UserGamePlayerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateWithoutUserInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserGamePlayerUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserGamePlayerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => UserGamePlayerUpdateManyMutationInputSchema),z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export const UserGameStatUpsertWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => UserGameStatUpdateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserGameStatCreateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => UserGameStatWhereInputSchema).optional()
}).strict();

export const UserGameStatUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserGameStatWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserGameStatUpdateWithoutUserInputSchema),z.lazy(() => UserGameStatUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserGameStatUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUpdateWithoutUserInput> = z.object({
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUpdateManyWithoutUserGameStatNestedInputSchema).optional()
}).strict();

export const UserGameStatUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGameStatUncheckedUpdateWithoutUserInput> = z.object({
  wonGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  lostGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  unstableGamesCount: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserGameStatNestedInputSchema).optional()
}).strict();

export const UserProfileUpsertWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => UserProfileUpdateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => UserProfileCreateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => UserProfileWhereInputSchema).optional()
}).strict();

export const UserProfileUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUpdateToOneWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => UserProfileWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserProfileUpdateWithoutUserInputSchema),z.lazy(() => UserProfileUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export const UserProfileUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUpdateWithoutUserInput> = z.object({
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserProfileUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserProfileUncheckedUpdateWithoutUserInput> = z.object({
  personalLink: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  photoUrl: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  nickname: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  connectStatus: z.union([ z.lazy(() => ConnectStatusSchema),z.lazy(() => EnumConnectStatusFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserCreateWithoutUserProfileInputSchema: z.ZodType<Prisma.UserCreateWithoutUserProfileInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerCreateNestedManyWithoutUserInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserUncheckedCreateWithoutUserProfileInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutUserProfileInput> = z.object({
  num: z.number().int().optional(),
  id: z.string().uuid().optional(),
  email: z.string().optional().nullable(),
  currentGameId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedCreateNestedOneWithoutUserInputSchema).optional()
}).strict();

export const UserCreateOrConnectWithoutUserProfileInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutUserProfileInput> = z.object({
  where: z.lazy(() => UserWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UserCreateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserProfileInputSchema) ]),
}).strict();

export const UserUpsertWithoutUserProfileInputSchema: z.ZodType<Prisma.UserUpsertWithoutUserProfileInput> = z.object({
  update: z.union([ z.lazy(() => UserUpdateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserProfileInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedCreateWithoutUserProfileInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional()
}).strict();

export const UserUpdateToOneWithWhereWithoutUserProfileInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutUserProfileInput> = z.object({
  where: z.lazy(() => UserWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UserUpdateWithoutUserProfileInputSchema),z.lazy(() => UserUncheckedUpdateWithoutUserProfileInputSchema) ]),
}).strict();

export const UserUpdateWithoutUserProfileInputSchema: z.ZodType<Prisma.UserUpdateWithoutUserProfileInput> = z.object({
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUpdateManyWithoutUserNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserUncheckedUpdateWithoutUserProfileInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutUserProfileInput> = z.object({
  num: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  id: z.union([ z.string().uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  currentGameId: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  UserGamePlayer: z.lazy(() => UserGamePlayerUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUncheckedUpdateOneWithoutUserNestedInputSchema).optional()
}).strict();

export const UserGamePlayerCreateManyUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerCreateManyUserGameStatInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerUpdateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithoutUserGameStatInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  DurakGame: z.lazy(() => DurakGameUpdateOneRequiredWithoutPlayersNestedInputSchema).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedUpdateWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateWithoutUserGameStatInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutUserGameStatInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutUserGameStatInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateManyDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerCreateManyDurakGameInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  userId: z.string(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerUpdateWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithoutDurakGameInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  User: z.lazy(() => UserUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedUpdateWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateWithoutDurakGameInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutDurakGameInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutDurakGameInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerCreateManyUserInputSchema: z.ZodType<Prisma.UserGamePlayerCreateManyUserInput> = z.object({
  index: z.number().int(),
  hasLost: z.boolean().optional(),
  durakGameNumber: z.number().int(),
  result: z.lazy(() => GameEndResultSchema),
  place: z.number().int(),
  roundLeftNumber: z.number().int()
}).strict();

export const UserGamePlayerUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUpdateWithoutUserInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  DurakGame: z.lazy(() => DurakGameUpdateOneRequiredWithoutPlayersNestedInputSchema).optional(),
  UserGameStat: z.lazy(() => UserGameStatUpdateOneRequiredWithoutUserGamePlayerNestedInputSchema).optional()
}).strict();

export const UserGamePlayerUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateWithoutUserInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const UserGamePlayerUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.UserGamePlayerUncheckedUpdateManyWithoutUserInput> = z.object({
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  hasLost: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  durakGameNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  result: z.union([ z.lazy(() => GameEndResultSchema),z.lazy(() => EnumGameEndResultFieldUpdateOperationsInputSchema) ]).optional(),
  place: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  roundLeftNumber: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserGameStatFindFirstArgsSchema: z.ZodType<Prisma.UserGameStatFindFirstArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereInputSchema.optional(),
  orderBy: z.union([ UserGameStatOrderByWithRelationInputSchema.array(),UserGameStatOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGameStatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGameStatScalarFieldEnumSchema,UserGameStatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGameStatFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserGameStatFindFirstOrThrowArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereInputSchema.optional(),
  orderBy: z.union([ UserGameStatOrderByWithRelationInputSchema.array(),UserGameStatOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGameStatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGameStatScalarFieldEnumSchema,UserGameStatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGameStatFindManyArgsSchema: z.ZodType<Prisma.UserGameStatFindManyArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereInputSchema.optional(),
  orderBy: z.union([ UserGameStatOrderByWithRelationInputSchema.array(),UserGameStatOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGameStatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGameStatScalarFieldEnumSchema,UserGameStatScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGameStatAggregateArgsSchema: z.ZodType<Prisma.UserGameStatAggregateArgs> = z.object({
  where: UserGameStatWhereInputSchema.optional(),
  orderBy: z.union([ UserGameStatOrderByWithRelationInputSchema.array(),UserGameStatOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGameStatWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGameStatGroupByArgsSchema: z.ZodType<Prisma.UserGameStatGroupByArgs> = z.object({
  where: UserGameStatWhereInputSchema.optional(),
  orderBy: z.union([ UserGameStatOrderByWithAggregationInputSchema.array(),UserGameStatOrderByWithAggregationInputSchema ]).optional(),
  by: UserGameStatScalarFieldEnumSchema.array(),
  having: UserGameStatScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGameStatFindUniqueArgsSchema: z.ZodType<Prisma.UserGameStatFindUniqueArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereUniqueInputSchema,
}).strict() ;

export const UserGameStatFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserGameStatFindUniqueOrThrowArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereUniqueInputSchema,
}).strict() ;

export const UserGamePlayerFindFirstArgsSchema: z.ZodType<Prisma.UserGamePlayerFindFirstArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereInputSchema.optional(),
  orderBy: z.union([ UserGamePlayerOrderByWithRelationInputSchema.array(),UserGamePlayerOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGamePlayerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGamePlayerScalarFieldEnumSchema,UserGamePlayerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGamePlayerFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserGamePlayerFindFirstOrThrowArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereInputSchema.optional(),
  orderBy: z.union([ UserGamePlayerOrderByWithRelationInputSchema.array(),UserGamePlayerOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGamePlayerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGamePlayerScalarFieldEnumSchema,UserGamePlayerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGamePlayerFindManyArgsSchema: z.ZodType<Prisma.UserGamePlayerFindManyArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereInputSchema.optional(),
  orderBy: z.union([ UserGamePlayerOrderByWithRelationInputSchema.array(),UserGamePlayerOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGamePlayerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserGamePlayerScalarFieldEnumSchema,UserGamePlayerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserGamePlayerAggregateArgsSchema: z.ZodType<Prisma.UserGamePlayerAggregateArgs> = z.object({
  where: UserGamePlayerWhereInputSchema.optional(),
  orderBy: z.union([ UserGamePlayerOrderByWithRelationInputSchema.array(),UserGamePlayerOrderByWithRelationInputSchema ]).optional(),
  cursor: UserGamePlayerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGamePlayerGroupByArgsSchema: z.ZodType<Prisma.UserGamePlayerGroupByArgs> = z.object({
  where: UserGamePlayerWhereInputSchema.optional(),
  orderBy: z.union([ UserGamePlayerOrderByWithAggregationInputSchema.array(),UserGamePlayerOrderByWithAggregationInputSchema ]).optional(),
  by: UserGamePlayerScalarFieldEnumSchema.array(),
  having: UserGamePlayerScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGamePlayerFindUniqueArgsSchema: z.ZodType<Prisma.UserGamePlayerFindUniqueArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereUniqueInputSchema,
}).strict() ;

export const UserGamePlayerFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserGamePlayerFindUniqueOrThrowArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereUniqueInputSchema,
}).strict() ;

export const DurakGameFindFirstArgsSchema: z.ZodType<Prisma.DurakGameFindFirstArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereInputSchema.optional(),
  orderBy: z.union([ DurakGameOrderByWithRelationInputSchema.array(),DurakGameOrderByWithRelationInputSchema ]).optional(),
  cursor: DurakGameWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DurakGameScalarFieldEnumSchema,DurakGameScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DurakGameFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DurakGameFindFirstOrThrowArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereInputSchema.optional(),
  orderBy: z.union([ DurakGameOrderByWithRelationInputSchema.array(),DurakGameOrderByWithRelationInputSchema ]).optional(),
  cursor: DurakGameWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DurakGameScalarFieldEnumSchema,DurakGameScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DurakGameFindManyArgsSchema: z.ZodType<Prisma.DurakGameFindManyArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereInputSchema.optional(),
  orderBy: z.union([ DurakGameOrderByWithRelationInputSchema.array(),DurakGameOrderByWithRelationInputSchema ]).optional(),
  cursor: DurakGameWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DurakGameScalarFieldEnumSchema,DurakGameScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const DurakGameAggregateArgsSchema: z.ZodType<Prisma.DurakGameAggregateArgs> = z.object({
  where: DurakGameWhereInputSchema.optional(),
  orderBy: z.union([ DurakGameOrderByWithRelationInputSchema.array(),DurakGameOrderByWithRelationInputSchema ]).optional(),
  cursor: DurakGameWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DurakGameGroupByArgsSchema: z.ZodType<Prisma.DurakGameGroupByArgs> = z.object({
  where: DurakGameWhereInputSchema.optional(),
  orderBy: z.union([ DurakGameOrderByWithAggregationInputSchema.array(),DurakGameOrderByWithAggregationInputSchema ]).optional(),
  by: DurakGameScalarFieldEnumSchema.array(),
  having: DurakGameScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const DurakGameFindUniqueArgsSchema: z.ZodType<Prisma.DurakGameFindUniqueArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereUniqueInputSchema,
}).strict() ;

export const DurakGameFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.DurakGameFindUniqueOrThrowArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereUniqueInputSchema,
}).strict() ;

export const SessionFindFirstArgsSchema: z.ZodType<Prisma.SessionFindFirstArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.SessionFindFirstOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionFindManyArgsSchema: z.ZodType<Prisma.SessionFindManyArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ SessionScalarFieldEnumSchema,SessionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const SessionAggregateArgsSchema: z.ZodType<Prisma.SessionAggregateArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithRelationInputSchema.array(),SessionOrderByWithRelationInputSchema ]).optional(),
  cursor: SessionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionGroupByArgsSchema: z.ZodType<Prisma.SessionGroupByArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
  orderBy: z.union([ SessionOrderByWithAggregationInputSchema.array(),SessionOrderByWithAggregationInputSchema ]).optional(),
  by: SessionScalarFieldEnumSchema.array(),
  having: SessionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const SessionFindUniqueArgsSchema: z.ZodType<Prisma.SessionFindUniqueArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.SessionFindUniqueOrThrowArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserScalarFieldEnumSchema,UserScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithRelationInputSchema.array(),UserOrderByWithRelationInputSchema ]).optional(),
  cursor: UserWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z.object({
  where: UserWhereInputSchema.optional(),
  orderBy: z.union([ UserOrderByWithAggregationInputSchema.array(),UserOrderByWithAggregationInputSchema ]).optional(),
  by: UserScalarFieldEnumSchema.array(),
  having: UserScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserProfileFindFirstArgsSchema: z.ZodType<Prisma.UserProfileFindFirstArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereInputSchema.optional(),
  orderBy: z.union([ UserProfileOrderByWithRelationInputSchema.array(),UserProfileOrderByWithRelationInputSchema ]).optional(),
  cursor: UserProfileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserProfileScalarFieldEnumSchema,UserProfileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserProfileFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserProfileFindFirstOrThrowArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereInputSchema.optional(),
  orderBy: z.union([ UserProfileOrderByWithRelationInputSchema.array(),UserProfileOrderByWithRelationInputSchema ]).optional(),
  cursor: UserProfileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserProfileScalarFieldEnumSchema,UserProfileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserProfileFindManyArgsSchema: z.ZodType<Prisma.UserProfileFindManyArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereInputSchema.optional(),
  orderBy: z.union([ UserProfileOrderByWithRelationInputSchema.array(),UserProfileOrderByWithRelationInputSchema ]).optional(),
  cursor: UserProfileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UserProfileScalarFieldEnumSchema,UserProfileScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const UserProfileAggregateArgsSchema: z.ZodType<Prisma.UserProfileAggregateArgs> = z.object({
  where: UserProfileWhereInputSchema.optional(),
  orderBy: z.union([ UserProfileOrderByWithRelationInputSchema.array(),UserProfileOrderByWithRelationInputSchema ]).optional(),
  cursor: UserProfileWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserProfileGroupByArgsSchema: z.ZodType<Prisma.UserProfileGroupByArgs> = z.object({
  where: UserProfileWhereInputSchema.optional(),
  orderBy: z.union([ UserProfileOrderByWithAggregationInputSchema.array(),UserProfileOrderByWithAggregationInputSchema ]).optional(),
  by: UserProfileScalarFieldEnumSchema.array(),
  having: UserProfileScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const UserProfileFindUniqueArgsSchema: z.ZodType<Prisma.UserProfileFindUniqueArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereUniqueInputSchema,
}).strict() ;

export const UserProfileFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserProfileFindUniqueOrThrowArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereUniqueInputSchema,
}).strict() ;

export const UserGameStatCreateArgsSchema: z.ZodType<Prisma.UserGameStatCreateArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  data: z.union([ UserGameStatCreateInputSchema,UserGameStatUncheckedCreateInputSchema ]),
}).strict() ;

export const UserGameStatUpsertArgsSchema: z.ZodType<Prisma.UserGameStatUpsertArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereUniqueInputSchema,
  create: z.union([ UserGameStatCreateInputSchema,UserGameStatUncheckedCreateInputSchema ]),
  update: z.union([ UserGameStatUpdateInputSchema,UserGameStatUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserGameStatCreateManyArgsSchema: z.ZodType<Prisma.UserGameStatCreateManyArgs> = z.object({
  data: z.union([ UserGameStatCreateManyInputSchema,UserGameStatCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGameStatCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserGameStatCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserGameStatCreateManyInputSchema,UserGameStatCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGameStatDeleteArgsSchema: z.ZodType<Prisma.UserGameStatDeleteArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  where: UserGameStatWhereUniqueInputSchema,
}).strict() ;

export const UserGameStatUpdateArgsSchema: z.ZodType<Prisma.UserGameStatUpdateArgs> = z.object({
  select: UserGameStatSelectSchema.optional(),
  include: UserGameStatIncludeSchema.optional(),
  data: z.union([ UserGameStatUpdateInputSchema,UserGameStatUncheckedUpdateInputSchema ]),
  where: UserGameStatWhereUniqueInputSchema,
}).strict() ;

export const UserGameStatUpdateManyArgsSchema: z.ZodType<Prisma.UserGameStatUpdateManyArgs> = z.object({
  data: z.union([ UserGameStatUpdateManyMutationInputSchema,UserGameStatUncheckedUpdateManyInputSchema ]),
  where: UserGameStatWhereInputSchema.optional(),
}).strict() ;

export const UserGameStatDeleteManyArgsSchema: z.ZodType<Prisma.UserGameStatDeleteManyArgs> = z.object({
  where: UserGameStatWhereInputSchema.optional(),
}).strict() ;

export const UserGamePlayerCreateArgsSchema: z.ZodType<Prisma.UserGamePlayerCreateArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  data: z.union([ UserGamePlayerCreateInputSchema,UserGamePlayerUncheckedCreateInputSchema ]),
}).strict() ;

export const UserGamePlayerUpsertArgsSchema: z.ZodType<Prisma.UserGamePlayerUpsertArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereUniqueInputSchema,
  create: z.union([ UserGamePlayerCreateInputSchema,UserGamePlayerUncheckedCreateInputSchema ]),
  update: z.union([ UserGamePlayerUpdateInputSchema,UserGamePlayerUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserGamePlayerCreateManyArgsSchema: z.ZodType<Prisma.UserGamePlayerCreateManyArgs> = z.object({
  data: z.union([ UserGamePlayerCreateManyInputSchema,UserGamePlayerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGamePlayerCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserGamePlayerCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserGamePlayerCreateManyInputSchema,UserGamePlayerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserGamePlayerDeleteArgsSchema: z.ZodType<Prisma.UserGamePlayerDeleteArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  where: UserGamePlayerWhereUniqueInputSchema,
}).strict() ;

export const UserGamePlayerUpdateArgsSchema: z.ZodType<Prisma.UserGamePlayerUpdateArgs> = z.object({
  select: UserGamePlayerSelectSchema.optional(),
  include: UserGamePlayerIncludeSchema.optional(),
  data: z.union([ UserGamePlayerUpdateInputSchema,UserGamePlayerUncheckedUpdateInputSchema ]),
  where: UserGamePlayerWhereUniqueInputSchema,
}).strict() ;

export const UserGamePlayerUpdateManyArgsSchema: z.ZodType<Prisma.UserGamePlayerUpdateManyArgs> = z.object({
  data: z.union([ UserGamePlayerUpdateManyMutationInputSchema,UserGamePlayerUncheckedUpdateManyInputSchema ]),
  where: UserGamePlayerWhereInputSchema.optional(),
}).strict() ;

export const UserGamePlayerDeleteManyArgsSchema: z.ZodType<Prisma.UserGamePlayerDeleteManyArgs> = z.object({
  where: UserGamePlayerWhereInputSchema.optional(),
}).strict() ;

export const DurakGameCreateArgsSchema: z.ZodType<Prisma.DurakGameCreateArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  data: z.union([ DurakGameCreateInputSchema,DurakGameUncheckedCreateInputSchema ]),
}).strict() ;

export const DurakGameUpsertArgsSchema: z.ZodType<Prisma.DurakGameUpsertArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereUniqueInputSchema,
  create: z.union([ DurakGameCreateInputSchema,DurakGameUncheckedCreateInputSchema ]),
  update: z.union([ DurakGameUpdateInputSchema,DurakGameUncheckedUpdateInputSchema ]),
}).strict() ;

export const DurakGameCreateManyArgsSchema: z.ZodType<Prisma.DurakGameCreateManyArgs> = z.object({
  data: z.union([ DurakGameCreateManyInputSchema,DurakGameCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DurakGameCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DurakGameCreateManyAndReturnArgs> = z.object({
  data: z.union([ DurakGameCreateManyInputSchema,DurakGameCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const DurakGameDeleteArgsSchema: z.ZodType<Prisma.DurakGameDeleteArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  where: DurakGameWhereUniqueInputSchema,
}).strict() ;

export const DurakGameUpdateArgsSchema: z.ZodType<Prisma.DurakGameUpdateArgs> = z.object({
  select: DurakGameSelectSchema.optional(),
  include: DurakGameIncludeSchema.optional(),
  data: z.union([ DurakGameUpdateInputSchema,DurakGameUncheckedUpdateInputSchema ]),
  where: DurakGameWhereUniqueInputSchema,
}).strict() ;

export const DurakGameUpdateManyArgsSchema: z.ZodType<Prisma.DurakGameUpdateManyArgs> = z.object({
  data: z.union([ DurakGameUpdateManyMutationInputSchema,DurakGameUncheckedUpdateManyInputSchema ]),
  where: DurakGameWhereInputSchema.optional(),
}).strict() ;

export const DurakGameDeleteManyArgsSchema: z.ZodType<Prisma.DurakGameDeleteManyArgs> = z.object({
  where: DurakGameWhereInputSchema.optional(),
}).strict() ;

export const SessionCreateArgsSchema: z.ZodType<Prisma.SessionCreateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  data: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
}).strict() ;

export const SessionUpsertArgsSchema: z.ZodType<Prisma.SessionUpsertArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereUniqueInputSchema,
  create: z.union([ SessionCreateInputSchema,SessionUncheckedCreateInputSchema ]),
  update: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
}).strict() ;

export const SessionCreateManyArgsSchema: z.ZodType<Prisma.SessionCreateManyArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SessionCreateManyAndReturnArgs> = z.object({
  data: z.union([ SessionCreateManyInputSchema,SessionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const SessionDeleteArgsSchema: z.ZodType<Prisma.SessionDeleteArgs> = z.object({
  select: SessionSelectSchema.optional(),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateArgsSchema: z.ZodType<Prisma.SessionUpdateArgs> = z.object({
  select: SessionSelectSchema.optional(),
  data: z.union([ SessionUpdateInputSchema,SessionUncheckedUpdateInputSchema ]),
  where: SessionWhereUniqueInputSchema,
}).strict() ;

export const SessionUpdateManyArgsSchema: z.ZodType<Prisma.SessionUpdateManyArgs> = z.object({
  data: z.union([ SessionUpdateManyMutationInputSchema,SessionUncheckedUpdateManyInputSchema ]),
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const SessionDeleteManyArgsSchema: z.ZodType<Prisma.SessionDeleteManyArgs> = z.object({
  where: SessionWhereInputSchema.optional(),
}).strict() ;

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
}).strict() ;

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
  create: z.union([ UserCreateInputSchema,UserUncheckedCreateInputSchema ]),
  update: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserCreateManyInputSchema,UserCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z.object({
  select: UserSelectSchema.optional(),
  include: UserIncludeSchema.optional(),
  data: z.union([ UserUpdateInputSchema,UserUncheckedUpdateInputSchema ]),
  where: UserWhereUniqueInputSchema,
}).strict() ;

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z.object({
  data: z.union([ UserUpdateManyMutationInputSchema,UserUncheckedUpdateManyInputSchema ]),
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z.object({
  where: UserWhereInputSchema.optional(),
}).strict() ;

export const UserProfileCreateArgsSchema: z.ZodType<Prisma.UserProfileCreateArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  data: z.union([ UserProfileCreateInputSchema,UserProfileUncheckedCreateInputSchema ]),
}).strict() ;

export const UserProfileUpsertArgsSchema: z.ZodType<Prisma.UserProfileUpsertArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereUniqueInputSchema,
  create: z.union([ UserProfileCreateInputSchema,UserProfileUncheckedCreateInputSchema ]),
  update: z.union([ UserProfileUpdateInputSchema,UserProfileUncheckedUpdateInputSchema ]),
}).strict() ;

export const UserProfileCreateManyArgsSchema: z.ZodType<Prisma.UserProfileCreateManyArgs> = z.object({
  data: z.union([ UserProfileCreateManyInputSchema,UserProfileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserProfileCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserProfileCreateManyAndReturnArgs> = z.object({
  data: z.union([ UserProfileCreateManyInputSchema,UserProfileCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const UserProfileDeleteArgsSchema: z.ZodType<Prisma.UserProfileDeleteArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  where: UserProfileWhereUniqueInputSchema,
}).strict() ;

export const UserProfileUpdateArgsSchema: z.ZodType<Prisma.UserProfileUpdateArgs> = z.object({
  select: UserProfileSelectSchema.optional(),
  include: UserProfileIncludeSchema.optional(),
  data: z.union([ UserProfileUpdateInputSchema,UserProfileUncheckedUpdateInputSchema ]),
  where: UserProfileWhereUniqueInputSchema,
}).strict() ;

export const UserProfileUpdateManyArgsSchema: z.ZodType<Prisma.UserProfileUpdateManyArgs> = z.object({
  data: z.union([ UserProfileUpdateManyMutationInputSchema,UserProfileUncheckedUpdateManyInputSchema ]),
  where: UserProfileWhereInputSchema.optional(),
}).strict() ;

export const UserProfileDeleteManyArgsSchema: z.ZodType<Prisma.UserProfileDeleteManyArgs> = z.object({
  where: UserProfileWhereInputSchema.optional(),
}).strict() ;