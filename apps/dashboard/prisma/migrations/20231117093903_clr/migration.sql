/*
  Warnings:

  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `status` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_created_by_fkey";

-- DropForeignKey
ALTER TABLE "status" DROP CONSTRAINT "status_user_id_fkey";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "status";
