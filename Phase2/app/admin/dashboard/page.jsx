'use client';

import { useEffect, useState } from 'react';
import '../../styles/adminStyle.css';
import '../../styles/Search.css';
import {
  getAllCoursesAction,
  validateClassAction,
  unvalidateClassAction,
  closeClassAction
} from '@/app/actions/courses';

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsed = JSON.parse(userData);
    setAdmin(parsed);

    const fetchCourses = async () => {
      const result = await getAllCoursesAction();
      setCourses(result);
    };

    fetchCourses();
  }, []);

  const handleValidate = async (crn) => {
    const result = await validateClassAction(crn);
    if (result.success) {
      setMessage('✅ Class validated!');
      const refreshed = await getAllCoursesAction();
      setCourses(refreshed);
    } else {
      setMessage('❌ Failed to validate class.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUnvalidate = async (crn) => {
    const result = await unvalidateClassAction(crn);
    if (result.success) {
      setMessage('✅ Class unvalidated!');
      const refreshed = await getAllCoursesAction();
      setCourses(refreshed);
    } else {
      setMessage('❌ Failed to unvalidate class.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleClose = async (crn) => {
    const result = await closeClassAction(crn);
    if (result.success) {
      setMessage('✅ Class closed!');
      const refreshed = await getAllCoursesAction();
      setCourses(refreshed);
    } else {
      setMessage('❌ Failed to close class.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const openCourses = courses.filter(c =>
    c.classes.some(cls => cls.status === 'Open')
  );
  const closedCourses = courses.filter(c =>
    c.classes.some(cls => cls.status === 'Closed')
  );
  const validatedCourses = courses.filter(c =>
    c.classes.some(cls => cls.status === 'Validated')
  );

  return (
    <>
      <div className="navigation">
        <header>
          <img src="/Assets/Logo.png" alt="Qatar University Logo" className="logo" />
          <div className="buttons">
            <button
              id="createBtn"
              className="create-course"
              onClick={() => window.location.href = '/admin/create-course'}
            >
              CREATE&nbsp;COURSE
            </button>
            <button
              id="statsBtn"
              className="create-course"
              onClick={() => window.location.href = '/admin/statistics'}
            >
              VIEW&nbsp;STATISTICS
            </button>
            <button
              className="logout"
              id="logoutBtn"
              onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
            >
              LOGOUT
            </button>
          </div>
        </header>
      </div>

      <div className="container">
        <h1>Admin Dashboard</h1>

        {message && (
          <div className={`msg ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {}
        <div className="course-group">
          <h2>🟢 Open Courses</h2>
          <div className="course-list">
            {openCourses.map(course =>
              course.classes
                .filter(cls => cls.status === 'Open')
                .map(cls => (
                  <div key={cls.crn} className="course-card status-open">
                    <p><strong>{course.name}</strong></p>
                    <p>CRN: {cls.crn}</p>
                    <p>Instructor: {cls.instructor?.name || '—'}</p>
                    <p>Section: {cls.section}</p>
                    <button onClick={() => handleValidate(cls.crn)}>VALIDATE</button>
                    <button onClick={() => handleClose(cls.crn)}>CLOSE</button>
                  </div>
                ))
            )}
          </div>
        </div>

        {}
        <div className="course-group">
          <h2>🔴 Closed Courses</h2>
          <div className="course-list">
            {closedCourses.map(course =>
              course.classes
                .filter(cls => cls.status === 'Closed')
                .map(cls => (
                  <div key={cls.crn} className="course-card status-closed">
                    <p><strong>{course.name}</strong></p>
                    <p>CRN: {cls.crn}</p>
                    <p>Instructor: {cls.instructor?.name || '—'}</p>
                    <p>Section: {cls.section}</p>
                    <button onClick={() => handleValidate(cls.crn)}>VALIDATE</button>
                  </div>
                ))
            )}
          </div>
        </div>

        {}
        <div className="course-group">
          <h2>✅ Validated Courses</h2>
          <div className="course-list">
            {validatedCourses.map(course =>
              course.classes
                .filter(cls => cls.status === 'Validated')
                .map(cls => (
                  <div key={cls.crn} className="course-card status-validated">
                    <p><strong>{course.name}</strong></p>
                    <p>CRN: {cls.crn}</p>
                    <p>Instructor: {cls.instructor?.name || '—'}</p>
                    <p>Section: {cls.section}</p>
                    <button onClick={() => handleUnvalidate(cls.crn)}>UNVALIDATE</button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
