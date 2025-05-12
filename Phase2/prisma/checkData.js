const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const studentsCount = await prisma.user.count({ where: { role: 'student' } });
  const instructorsCount = await prisma.user.count({ where: { role: 'instructor' } });
  const adminsCount = await prisma.user.count({ where: { role: 'admin' } });

  const coursesCount = await prisma.course.count();
  const classesCount = await prisma.class.count();
  const registrationsCount = await prisma.registration.count();
  const completedCoursesCount = await prisma.completedCourse.count();
  const majorsCount = await prisma.major.count();

  console.log(`Students: ${studentsCount}`);
  console.log(`Instructors: ${instructorsCount}`);
  console.log(`Admins: ${adminsCount}`);
  console.log(`Courses: ${coursesCount}`);
  console.log(`Classes: ${classesCount}`);
  console.log(`Registrations: ${registrationsCount}`);
  console.log(`Completed Courses: ${completedCoursesCount}`);
  console.log(`Majors: ${majorsCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
