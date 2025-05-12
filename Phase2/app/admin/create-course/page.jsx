'use client';

import { useState } from 'react';
import '../../styles/adminStyle.css';
import '../../styles/Search.css'
import { createCourseAction } from '@/app/actions/courses';

export default function CreateCoursePage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const result = await createCourseAction(data);
      if (result.success) {
        setSuccess('✅ Course created successfully!');
        setError('');
        e.target.reset();
      } else {
        setError(result.message || '❌ Failed to create course.');
        setSuccess('');
      }
    } catch (err) {
      setError('❌ Error submitting form.');
      setSuccess('');
    }
  };

  return (
    <>
      {}
      <div className="navigation">
        <header>
          <img src="/Assets/Logo.png" alt="Qatar University Logo" className="logo" />
          <div className="buttons">
            <button className="browse" onClick={() => window.location.href = '/admin/dashboard'}>
              DASHBOARD
            </button>
          </div>
        </header>
      </div>

      {}
      <div className="container">
        <h1>Create a New Course</h1>

        {}
        <form onSubmit={handleSubmit} id="courseForm">
          <input type="text" name="courseName" placeholder="Course Name" required />
          <input type="text" name="courseNo" placeholder="Course Code (e.g. CS105)" required />
          <input type="text" name="category" placeholder="Category (e.g. Computer Science)" required />
          <input type="text" name="instructor" placeholder="Instructor Name" required />

          <label className="field-label">Gender</label>
          <select name="gender" defaultValue="Male" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <label className="field-label">Status</label>
          <select name="status" defaultValue="Open" required>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Validated">Validated</option>
          </select>

          <input type="text" name="schedule" placeholder="Schedule (e.g. Sun/Tue 10:00 - 11:15 AM)" required />
          <input type="number" name="maxCapacity" placeholder="Max Capacity" required />
          <input type="text" name="prerequisites" placeholder="Prerequisites (comma-separated course numbers)" />
          <input type="text" name="eligibleMajors" placeholder="Eligible Majors (comma-separated)" />

          <button type="submit">ADD COURSE</button>
          {error && <p id="errorMessage" style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
        </form>
      </div>
    </>
  );
}
