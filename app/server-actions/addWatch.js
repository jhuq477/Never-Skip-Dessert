'use server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function addWatch(formData) {

    // get data from the form
    const model = formData.get('model')
    const brand = formData.get('brand')
    const referenceNumber = formData.get('referenceNumber')

    // create server client that has the session
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    const {data: {session}} = await supabase.auth.getSession();
    const user = session?.user

    if (!user){
        console.error('User is not authenticated within addWatch server action')
        return;
    }

    // insert new watch into the users id table
    const {data,error} = await supabase 
        .from('watches')
        .insert([
            {
                model,
                brand,
                reference_number: referenceNumber,
                user_id: user.id
            }
        ])

    if (error) {
        console.error('Error inserting data', error)
        return;
    }

    // revalidate the page to see the updated watch
    revalidatePath('/watch-list')

    return {message: 'Success'}
}
