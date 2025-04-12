import { NextResponse } from 'next/server';
import { getCourseByCrn, updateCourse, deleteCourse } from '../../../repo/courses-repo.js';

export async function GET(request, { params }) {
  const { crn } = params;
  try {
    const course = await getCourseByCrn(crn);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(course, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { crn } = params;
  try {
    const updates = await request.json();
    const updated = await updateCourse(crn, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { crn } = params;
  try {
    const removed = await deleteCourse(crn);
    if (!removed) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Course deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
