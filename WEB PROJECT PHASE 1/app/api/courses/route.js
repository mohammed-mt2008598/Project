import { NextResponse } from 'next/server';
import { getAllCourses, createCourse } from '../../repo/courses-repo.js';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json(courses, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newCourse = await request.json();
    const created = await createCourse(newCourse);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
