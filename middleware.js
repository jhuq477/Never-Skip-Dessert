import {createMiddlewareClient} from '@supabase/auth-helpers-nextjs';
import {NextResponse} from 'next/server';

export async function middleware(req) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({req, res});

    const {data: {user}} = await supabase.auth.getUser();

    // if user is logged in, dont let them go to login page in "/"
    if (user && req.nextUrl.pathname === '/'){
        // instead of base url (req.url) take them to /watch-list
        return NextResponse.redirect(new URL('/watch-list', req.url))
    }

    // not logged in, take them to login
    if (!user && req.nextUrl.pathname !== '/'){
        return NextResponse.redirect(new URL('/', req.url))
    }

    return res;
}

// when do we want the middleware to run
export const config = {
    matcher: ['/', '/watch-list']
}