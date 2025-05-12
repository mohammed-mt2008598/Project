'use client';

import '../../styles/statisticsStyle.css';
import '../../styles/Search.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


function decodeJwt() {
  const token = localStorage.getItem('id_token');
  if (!token) return null;

  try {
    const [, payload] = token.split('.');
    const data = JSON.parse(atob(payload));
    if (data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = decodeJwt();

    if (!user) {
      router.push('/login');
      return;
    }


    fetch('/api/statistics')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  if (!stats) return <p>Loading statistics...</p>;

  return (
    <>
      {}
      <div className="navigation">
        <header>
          <img src="/Assets/Logo.png" alt="Qatar University Logo" className="logo" />
          <div className="buttons">
            <button onClick={() => window.location.href = '/admin/dashboard'}>
              Dashboard
            </button>
          </div>
        </header>
      </div>

      {}
      <div className='statistics-container' style={{ padding: '30px' }}>
        <h1>📊 Student Management Statistics</h1>
        <ul>
          <li><strong>Total Students:</strong> {stats.totalStudents}</li>

          <li><strong>Students per Major:</strong>
            <ul>
              {stats.studentsPerMajor.map((m, i) => (
                <li key={i}>{m.major}: {m._count.major}</li>
              ))}
            </ul>
          </li>

          <li><strong>Students by Gender:</strong>
            <ul>
              {stats.studentsByGender.map((g, i) => (
                <li key={i}>{g.gender}: {g._count.gender}</li>
              ))}
            </ul>
          </li>

          <li><strong>Total Instructors:</strong> {stats.totalInstructors}</li>

          <li><strong>Top 3 Enrolled Courses:</strong>
            <ul>
              {stats.top3EnrolledCourses.map((c, i) => (
                <li key={i}>{c.course.name} ({c.enrolled} enrolled)</li>
              ))}
            </ul>
          </li>

          <li><strong>Course with Most Students:</strong> {stats.courseWithMostStudents?.course.name} ({stats.courseWithMostStudents?.enrolled} enrolled)</li>

          <li><strong>Avg Completed Courses per Student:</strong> {stats.avgCompletedCoursesPerStudent.toFixed(2)}</li>

          <li><strong>Most Common Grade:</strong> {stats.mostCommonGrade.grade} ({stats.mostCommonGrade._count.grade} times)</li>

          <li><strong>Courses per Category:</strong>
            <ul>
              {stats.coursesPerCategory.map((cat, i) => (
                <li key={i}>{cat.category}: {cat._count.category}</li>
              ))}
            </ul>
          </li>

          <li><strong>Open Courses Count:</strong> {stats.openCoursesCount}</li>
          <li><strong>Validated Courses Count:</strong> {stats.validatedCoursesCount}</li>
          <li><strong>Avg Class Capacity Usage:</strong> {stats.avgClassCapacityUsage.toFixed(2)}%</li>
          <li><strong>% Completed Calculus:</strong> {stats.percentCompletedCalculus}%</li>
          <li><strong>Students with GPA ≥ 3.5:</strong> {stats.studentsWithHighGpa}</li>

          <li><strong>Failure Rate per Course:</strong>
            <ul>
              {stats.failureRatePerCourse.map((fail, i) => (
                <li key={i}>Class {fail.classId}: {fail._count._all} failures</li>
              ))}
            </ul>
          </li>

          <li><strong>Courses Requiring Prerequisites:</strong> {stats.coursesWithPrerequisitesCount}</li>
        </ul>
      </div>
    </>
  );
}
