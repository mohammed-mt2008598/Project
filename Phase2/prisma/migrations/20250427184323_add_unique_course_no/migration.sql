/*
  Warnings:

  - A unique constraint covering the columns `[courseNo]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_courseNo_key" ON "Course"("courseNo");
