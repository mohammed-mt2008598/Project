'use server';

import CompletedCourseRepo from '@/app/repo/completed-course-repo';
import RegistrationRepo from '@/app/repo/registration-repo';
import CourseRepo from '@/app/repo/courses-repo';


export async function getCompletedCoursesByStudentIdAction(studentId) {
  return await CompletedCourseRepo.getCompletedCoursesByStudentId(Number(studentId));
}

export async function getRegistrationsByStudentIdAction(studentId) {
  return await RegistrationRepo.getRegistrationsByStudentId(Number(studentId));
}

export async function getPendingCoursesByStudentIdAction(studentId) {
  return await CourseRepo.getPendingCoursesForStudent(Number(studentId));
}



