'use server';

import CourseRepo from '@/app/repo/courses-repo';
import ClassRepo from '@/app/repo/class-repo';


export async function getAllCoursesAction() {
  try {
    const courses = await CourseRepo.getAllCourses();
    return courses;
  } catch (err) {
    console.error('Failed to fetch courses:', err);
    return [];
  }
}


export async function validateClassAction(crn) {
  try {
    await ClassRepo.validateClass(crn);
    return { success: true };
  } catch (err) {
    console.error('Failed to validate class:', err);
    return { success: false };
  }
}


export async function unvalidateClassAction(crn) {
  try {
    await ClassRepo.unvalidateClass(crn);
    return { success: true };
  } catch (err) {
    console.error('Failed to unvalidate class:', err);
    return { success: false };
  }
}


export async function closeClassAction(crn) {
  try {
    await ClassRepo.closeClass(crn);
    return { success: true };
  } catch (err) {
    console.error('Failed to close class:', err);
    return { success: false };
  }
}
