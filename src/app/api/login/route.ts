import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: 'username and password required' },
      { status: 400 }
    );
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = result[0];

  if (!user) {
    return NextResponse.json(
      { error: 'invalid credentials' },
      { status: 401 }
    );
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);

  if (!passwordOk) {
    return NextResponse.json(
      { error: 'invalid credentials' },
      { status: 401 }
    );
  }

  const token = await signToken({
    sub: String(user.id),
    username: user.username,
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
    },
  });

  response.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return response;
}
