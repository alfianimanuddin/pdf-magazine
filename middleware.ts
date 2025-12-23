import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const hostname = req.headers.get('host') || ''

  // Redirect majalah.tadatodays.com to tadatodays.com home page only in production
  if (
    process.env.NODE_ENV === 'production' &&
    hostname === 'majalah.tadatodays.com' &&
    pathname === '/'
  ) {
    const url = req.nextUrl.clone()
    url.host = 'tadatodays.com'
    return NextResponse.redirect(url, 301)
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Redirect to dashboard if already logged in
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
}
