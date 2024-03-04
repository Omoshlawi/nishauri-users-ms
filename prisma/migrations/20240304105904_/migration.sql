/*
  Warnings:

  - You are about to drop the column `allergies` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `bloodGroup` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `chronics` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `disabilities` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `educationLevel` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `occupation` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Person` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Person_username_key";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "allergies",
DROP COLUMN "bloodGroup",
DROP COLUMN "chronics",
DROP COLUMN "disabilities",
DROP COLUMN "educationLevel",
DROP COLUMN "height",
DROP COLUMN "occupation",
DROP COLUMN "username",
DROP COLUMN "weight";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "PatientProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bloodGroup" TEXT,
    "weight" TEXT,
    "height" TEXT,
    "educationLevel" TEXT,
    "occupation" TEXT,
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chronics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disabilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfile_userId_key" ON "PatientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Person_userId_key" ON "Person"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
