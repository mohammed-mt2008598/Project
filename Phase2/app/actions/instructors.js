'use server';

import InstructorRepo from '@/app/repo/instructor-repo';

export async function getClassesByInstructorNameAction(instructorName) {
  return await InstructorRepo.getClassesByInstructorName(instructorName);
}

export async function submitGradeAction(data) {
  try {
    await InstructorRepo.submitGrade(data);
    return { success: true };
  } catch (err) {
    console.error('submitGradeAction error:', err);
    return { success: false };
  }
}
