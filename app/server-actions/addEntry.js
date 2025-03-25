'use server'
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function addEntry(formData) {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    
    // Use getUser() instead of getSession() for security as suggested by the error
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.error('User is not authenticated within addEntry server action', userError);
        return;
    }

    const type = formData.get('type')
    const name = formData.get('name')

    const entry = {
        user_id: user.id, // Explicitly set the user_id field
        name,
        type,
        calories: null,
        protein: null,
        grams: null,
        cal_per_100g: null,
        protein_per_100g: null,
    }

    if (type === 'meal') {
        entry.calories = parseFloat(formData.get('calories'))
        entry.protein = parseFloat(formData.get('protein'))
    } else if (type === 'food') {
        entry.grams = parseFloat(formData.get('grams'))
        entry.cal_per_100g = parseFloat(formData.get('cal_per_100g'))
        entry.protein_per_100g = parseFloat(formData.get('protein_per_100g'))
    }

    const { error } = await supabase.from('entries').insert([entry])
    if (error) {
        console.error('Error inserting entry:', error)
        // You might want to return the error to handle it in the UI
        return { success: false, error };
    }

    revalidatePath('/meal-board')
    return { success: true };
}