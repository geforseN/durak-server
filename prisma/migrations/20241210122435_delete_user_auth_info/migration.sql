/*
  Warnings:

  - You are about to drop the `UserAuthInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAuthInfo" DROP CONSTRAINT "UserAuthInfo_userId_fkey";

-- DropTable
DROP TABLE "UserAuthInfo";
