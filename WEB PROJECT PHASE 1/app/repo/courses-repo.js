import fs from 'fs/promises';
import path from 'path';

const coursesFile = path.join(process.cwd(), 'data', 'courses.json');

export async function getAllCourses() {
  const raw = await fs.readFile(coursesFile, 'utf8');
  return JSON.parse(raw);
}

export async function getCourseByCrn(crn) {
  const all = await getAllCourses();
  return all.find(c => c.crn === crn);
}

export async function createCourse(courseData) {
  const raw = await fs.readFile(coursesFile, 'utf8');
  const data = JSON.parse(raw);

  data.push(courseData);
  await fs.writeFile(coursesFile, JSON.stringify(data, null, 2));
  return courseData;
}

export async function updateCourse(crn, updates) {
  const raw = await fs.readFile(coursesFile, 'utf8');
  const data = JSON.parse(raw);

  const index = data.findIndex(c => c.crn === crn);
  if (index === -1) return null;

  data[index] = { ...data[index], ...updates };
  await fs.writeFile(coursesFile, JSON.stringify(data, null, 2));
  return data[index];
}

export async function deleteCourse(crn) {
  const raw = await fs.readFile(coursesFile, 'utf8');
  let data = JSON.parse(raw);

  const before = data.length;
  data = data.filter(c => c.crn !== crn);

  if (data.length === before) {
    return false;
  }

  await fs.writeFile(coursesFile, JSON.stringify(data, null, 2));
  return true;
}
