const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  console.log("Seeding database...");


  const coursesPath = './prisma/courses.json';
  const usersPath = './prisma/users.json';

  if (!fs.existsSync(coursesPath) || !fs.existsSync(usersPath)) {
    console.error('❌ courses.json or users.json not found.');
    return;
  }

  const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8')).users;

  console.log(`✅ Loaded ${coursesData.length} courses`);
  console.log(`✅ Loaded ${usersData.length} users`);


  const allMajors = new Set();
  coursesData.forEach(course => {
    course.eligibleMajors.forEach(major => allMajors.add(major));
  });

  const majorsMap = {};
  for (const major of allMajors) {
    const createdMajor = await prisma.major.upsert({
      where: { name: major },
      update: {},
      create: { name: major }
    });
    majorsMap[major] = createdMajor.id;
  }
  console.log("✅ Majors seeded");


  const courseMap = {};
  for (const course of coursesData) {
    const createdCourse = await prisma.course.upsert({
      where: { courseNo: course.courseNo },
      update: {},
      create: {
        courseNo: course.courseNo,
        name: course.name,
        category: course.category,
        eligibleMajors: {
          connect: course.eligibleMajors.map(major => ({ id: majorsMap[major] }))
        }
      }
    });
    courseMap[course.courseNo] = createdCourse.id;
  }
  console.log("✅ Courses seeded");


  const classMap = {};
  for (const course of coursesData) {
    const instructorUsername = course.instructor.toLowerCase().replace(/\s/g, '');

    const instructor = await prisma.user.upsert({
      where: { username: instructorUsername },
      update: {},
      create: {
        username: instructorUsername,
        password: '123',
        role: 'instructor',
        name: course.instructor
      }
    });

    const createdClass = await prisma.class.upsert({
      where: { crn: course.crn },
      update: {},
      create: {
        crn: course.crn,
        section: course.section,
        status: course.status,
        maxCapacity: course.maxCapacity,
        enrolled: course.enrolled,
        schedule: course.schedule,
        gender: course.gender,
        instructorId: instructor.id,
        courseId: courseMap[course.courseNo]
      }
    });

    classMap[course.crn] = createdClass.id;
  }
  console.log("✅ Classes seeded");


  for (const user of usersData) {
    const createdUser = await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: {
        username: user.username,
        password: user.password,
        role: user.role,
        name: user.name,
        major: user.major || null,
        gender: user.gender || null,
        expertise: user.expertise
          ? { create: user.expertise.map(exp => ({ name: exp })) }
          : undefined
      }
    });


    if (user.completedCourses) {
      for (const completed of user.completedCourses) {
        if (!classMap[completed.crn]) {
          console.warn(`⚠️ Skipping completed course for ${user.username}: CRN ${completed.crn} not found.`);
          continue;
        }
        await prisma.completedCourse.create({
          data: {
            studentId: createdUser.id,
            classId: classMap[completed.crn],
            grade: completed.grade
          }
        });
      }
    }


    if (user.currentlyRegistered) {
      for (const reg of user.currentlyRegistered) {
        const crn = typeof reg === 'string' ? reg : reg.crn;
        if (!classMap[crn]) {
          console.warn(`⚠️ Skipping registration for ${user.username}: CRN ${crn} not found.`);
          continue;
        }
        await prisma.registration.create({
          data: {
            studentId: createdUser.id,
            classId: classMap[crn]
          }
        });
      }
    }
  }

  console.log("✅ Users, registrations, and completed courses seeded.");
}

main()
  .catch(e => {
    console.error("❌ Error during seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("✅ Database connection closed.");
  });
