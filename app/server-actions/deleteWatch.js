'use server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function deleteWatch(formData) {

    // get watch from the form
    const watchId = formData.get('id')

    // create server client that has the session
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    const {data: {session}} = await supabase.auth.getSession();
    const user = session?.user

    if (!user){
        console.error('User is not authenticated within deleteWatch server action')
        return;
    }

    // insert new watch into the users id table
    const {error} = await supabase 
        .from('watches')
        .delete()
        .match({id: watchId, user_id: user.id})

    if (error) {
        console.error('Error deleting data', error)
        return;
    }

    // revalidate the page to see the updated watch
    revalidatePath('/watch-list')

    return {message: 'Success'}
}
