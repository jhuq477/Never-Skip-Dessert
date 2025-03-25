'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'

export async function saveNutritionGoals(formData) {
  try {
    const dailyCalories = parseInt(formData.get('dailyCalories'))
    const dailyProtein = parseInt(formData.get('dailyProtein'))
    
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return { error: 'You must be logged in to save nutrition goals' }
    }
    
    const userId = session.user.id
    
    // Check if user already has goals
    const { data: existingGoals } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    let result
    
    if (existingGoals) {
      // Update existing goals
      result = await supabase
        .from('user_goals')
        .update({
          daily_calories: dailyCalories,
          daily_protein: dailyProtein,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    } else {
      // Insert new goals
      result = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          daily_calories: dailyCalories,
          daily_protein: dailyProtein
        })
    }
    
    if (result.error) {
      throw new Error(result.error.message)
    }
    
    // Revalidate the meal-board page to show updated goals
    revalidatePath('/meal-board')
    
    return { success: true }
  } catch (error) {
    console.error('Error saving nutrition goals:', error)
    return { error: error.message }
  }
}