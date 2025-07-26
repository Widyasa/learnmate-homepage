import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = await supabase.auth.getSession()

    const publicPaths = ['/', '/login', '/register']
    const currentPath = req.nextUrl.pathname

    if (!session && !publicPaths.includes(currentPath)) {
        // Belum login, hanya boleh akses root, login, register
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && (currentPath === '/login' || currentPath === '/register')) {
        // Sudah login, tidak boleh akses login/register
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}