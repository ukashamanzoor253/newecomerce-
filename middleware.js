import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/admin', '/user', '/super-admin', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user role if logged in
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Role-based routing
    if (profile) {
      const userRole = profile.role
      
      // Redirect to appropriate dashboard based on role
      if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/dashboard') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }
      
      // Restrict access based on role
      if (request.nextUrl.pathname.startsWith('/admin') && !['admin', 'super_admin'].includes(userRole)) {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }
      
      if (request.nextUrl.pathname.startsWith('/super-admin') && userRole !== 'super_admin') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}