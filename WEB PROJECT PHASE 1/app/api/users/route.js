import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '../../repo/users-repo.js';

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newUser = await request.json();
    const created = await createUser(newUser);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
