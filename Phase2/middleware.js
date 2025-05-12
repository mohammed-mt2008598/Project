import { NextResponse } from 'next/server';


function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;
  } catch (err) {
    return null;
  }
}

export function middleware(req) {

  const token =
    req.cookies.get('id_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const decoded = decodeJwt(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    return NextResponse.redirect(new URL('/login', req.url));
  }


  const path = req.nextUrl.pathname;
  if (path.startsWith('/admin') && decoded.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (path.startsWith('/student') && decoded.role !== 'student') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (path.startsWith('/instructor') && decoded.role !== 'instructor') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/:path*',
    '/instructor/:path*'
  ]
};
