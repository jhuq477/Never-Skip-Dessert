'use server'
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function editEntry(formData) {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.error('User is not authenticated within editEntry server action', userError);
        return { success: false, error: 'Authentication failed' };
    }

    const id = formData.get('id')
    const type = formData.get('type')
    const name = formData.get('name')

    // First verify the entry belongs to the current user
    const { data: existingEntry, error: fetchError } = await supabase
        .from('entries')
        .select('user_id')
        .eq('id', id)
        .single();
        
    if (fetchError) {
        console.error('Error fetching entry for verification:', fetchError);
        return { success: false, error: fetchError };
    }
    
    if (existingEntry.user_id !== user.id) {
        console.error('User attempting to edit an entry they do not own');
        return { success: false, error: 'Unauthorized' };
    }

    const entry = {
        name,
        // Don't update the type as it could cause data issues
    }

    if (type === 'meal') {
        entry.calories = parseFloat(formData.get('calories'))
        entry.protein = parseFloat(formData.get('protein'))
    } else if (type === 'food') {
        entry.grams = parseFloat(formData.get('grams'))
        entry.cal_per_100g = parseFloat(formData.get('cal_per_100g'))
        entry.protein_per_100g = parseFloat(formData.get('protein_per_100g'))
    }

    const { error } = await supabase
        .from('entries')
        .update(entry)
        .eq('id', id)
    
    if (error) {
        console.error('Error updating entry:', error)
        return { success: false, error };
    }

    revalidatePath('/meal-board')
    return { success: true };
}