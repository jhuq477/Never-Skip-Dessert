import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// when the magic link is clicked, user is sent to this route with a code in the searchparams of this route
export async function GET(req){
    //supabase uses cookie based authentication
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({cookies: () => cookieStore});

    const {searchParams} = new URL(req.url);

    const code = searchParams.get('code');

    if (code) {
        // pass in the code in return for a session 
        await supabase.auth.exchangeCodeForSession(code);
    }

    // send them to the logged in page after
    return NextResponse.redirect(new URL('/meal-board', req.url))
}