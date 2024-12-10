-- CreateEnum
CREATE TYPE "ConnectStatus" AS ENUM ('ONLINE', 'AWAY', 'OFFLINE');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('START_WAITING', 'STARTED', 'ENDED');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('BASIC', 'PEREVODNOY');

-- CreateEnum
CREATE TYPE "GameEndResult" AS ENUM ('WON', 'LOST');

-- CreateTable
CREATE TABLE "DurakGame" (
    "number" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "playersCount" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'START_WAITING',
    "cardCount" INTEGER NOT NULL,
    "gameType" "GameType" NOT NULL,
    "moveTime" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "num" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "email" TEXT,
    "currentGameId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuthInfo" (
    "userId" TEXT NOT NULL,
    "hash" TEXT,
    "yandexId" TEXT,
    "githubId" INTEGER,
    "vkId" INTEGER,
    "twitchId" TEXT,

    CONSTRAINT "UserAuthInfo_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserGamePlayer" (
    "index" INTEGER NOT NULL,
    "hasLost" BOOLEAN NOT NULL DEFAULT false,
    "durakGameNumber" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "result" "GameEndResult" NOT NULL,
    "place" INTEGER NOT NULL,
    "roundLeftNumber" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "UserGameStat" (
    "userId" TEXT NOT NULL,
    "wonGamesCount" INTEGER NOT NULL DEFAULT 0,
    "lostGamesCount" INTEGER NOT NULL DEFAULT 0,
    "unstableGamesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameStat_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "personalLink" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "nickname" TEXT NOT NULL DEFAULT 'Durak Player',
    "connectStatus" "ConnectStatus" NOT NULL DEFAULT 'OFFLINE',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DurakGame_number_key" ON "DurakGame"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "User_num_key" ON "User"("num");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthInfo_userId_key" ON "UserAuthInfo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthInfo_yandexId_key" ON "UserAuthInfo"("yandexId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthInfo_githubId_key" ON "UserAuthInfo"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthInfo_vkId_key" ON "UserAuthInfo"("vkId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthInfo_twitchId_key" ON "UserAuthInfo"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGamePlayer_durakGameNumber_index_key" ON "UserGamePlayer"("durakGameNumber", "index");

-- CreateIndex
CREATE UNIQUE INDEX "UserGameStat_userId_key" ON "UserGameStat"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_personalLink_key" ON "UserProfile"("personalLink");

-- AddForeignKey
ALTER TABLE "UserAuthInfo" ADD CONSTRAINT "UserAuthInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGamePlayer" ADD CONSTRAINT "UserGamePlayer_durakGameNumber_fkey" FOREIGN KEY ("durakGameNumber") REFERENCES "DurakGame"("number") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGamePlayer" ADD CONSTRAINT "UserGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGamePlayer" ADD CONSTRAINT "userGameStatId" FOREIGN KEY ("userId") REFERENCES "UserGameStat"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameStat" ADD CONSTRAINT "UserGameStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
