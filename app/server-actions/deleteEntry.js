'use server'
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function deleteEntry(formData) {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore})
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.error('User is not authenticated within deleteEntry server action', userError);
        return { success: false, error: 'Authentication failed' };
    }

    const id = formData.get('id')

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
        console.error('User attempting to delete an entry they do not own');
        return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
    
    if (error) {
        console.error('Error deleting entry:', error)
        return { success: false, error };
    }

    revalidatePath('/meal-board')
    return { success: true };
}