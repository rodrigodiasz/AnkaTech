/*
  Warnings:

  - You are about to alter the column `valor` on the `Alocacao` table. The data in that column could be lost. The data in that column will be cast from `Double` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Alocacao` MODIFY `valor` VARCHAR(191) NOT NULL;
