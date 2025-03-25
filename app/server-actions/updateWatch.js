'use server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function updateWatch(formData) {

    // get data from the form

    const id = formData.get('id')
    if (!id || isNaN(parseInt(id))) {
        console.error("Invalid ID:", id);
        return;
    }
    const model = formData.get('model')
    if (!model) {
        console.error("error with model")
    }
    const brand = formData.get('brand')
    if (!brand) {
        console.error("error with brand")
    }
    const referenceNumber = formData.get('referenceNumber')
    if (!referenceNumber) {
        console.error("error with referenceNumber")
    }

    // create server client that has the session
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    const {data: {session}} = await supabase.auth.getSession();
    const user = session?.user

    if (!user){
        console.error('User is not authenticated within updateWatch server action')
        return;
    }

    // insert new watch into the users id table
    const {data,error} = await supabase 
        .from('watches')
        .update(
            {
                model,
                brand,
                reference_number: referenceNumber,
            }
        ).match({id, user_id: user.id})

    if (error) {
        console.error('Error inserting data', error)
        return;
    }

    // revalidate the page to see the updated watch
    revalidatePath('/watch-list')

    return {message: 'Success'}
}
