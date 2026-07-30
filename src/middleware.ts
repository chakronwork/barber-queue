import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith('/api/queues');
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    if (token) {
      try {
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/queues', request.url));
      } catch {
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    if (isApi) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/queues', '/queues/:path*', '/api/queues/:path*', '/login'],
};
