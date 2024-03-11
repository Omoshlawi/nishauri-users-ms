/*
  Warnings:

  - You are about to drop the column `alergy` on the `PatientProfileAllergy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[allergy,patientProfileId]` on the table `PatientProfileAllergy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chronicIllness,patientProfileId]` on the table `PatientProfileChronicIllness` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[disability,patientProfileId]` on the table `PatientProfileDisability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `allergy` to the `PatientProfileAllergy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PatientProfileAllergy` DROP COLUMN `alergy`,
    ADD COLUMN `allergy` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PatientProfileAllergy_allergy_patientProfileId_key` ON `PatientProfileAllergy`(`allergy`, `patientProfileId`);

-- CreateIndex
CREATE UNIQUE INDEX `PatientProfileChronicIllness_chronicIllness_patientProfileId_key` ON `PatientProfileChronicIllness`(`chronicIllness`, `patientProfileId`);

-- CreateIndex
CREATE UNIQUE INDEX `PatientProfileDisability_disability_patientProfileId_key` ON `PatientProfileDisability`(`disability`, `patientProfileId`);
