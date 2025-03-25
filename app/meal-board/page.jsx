import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import MealFormWrapper from '../components/MealFormWrapper'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditDeleteButtons from '../components/EditDeleteButtons'
import { CalendarDays, Flame, TrendingUp } from 'lucide-react'

export default async function EntryList() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session || !session.user) {
    redirect('/login')
  }
  
  const user = session.user

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  const { data: userGoals } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching entries:', error.message)
  }

  const safeEntries = entries || []
  const goals = userGoals || {
    daily_calories: 2000,
    daily_protein: 150
  }

  const totals = safeEntries.reduce(
    (acc, item) => {
      let calories = 0
      let protein = 0

      if (item.type === 'meal') {
        calories = item.calories || 0
        protein = item.protein || 0
      } else if (item.type === 'food') {
        calories = ((item.grams || 0) / 100) * (item.cal_per_100g || 0)
        protein = ((item.grams || 0) / 100) * (item.protein_per_100g || 0)
      }

      acc.calories += calories
      acc.protein += protein
      return acc
    },
    { calories: 0, protein: 0 }
  )

  const caloriePercentage = Math.min(100, Math.round((totals.calories / goals.daily_calories) * 100))
  const proteinPercentage = Math.min(100, Math.round((totals.protein / goals.daily_protein) * 100))
  const remainingCalories = Math.max(0, goals.daily_calories - totals.calories)
  const remainingProtein = Math.max(0, goals.daily_protein - totals.protein)

  // Calculate meal distribution for the summary cards
  const mealCount = safeEntries.filter(item => item.type === 'meal').length
  const foodCount = safeEntries.filter(item => item.type === 'food').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            Today's Nutrition
          </h1>
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium px-5 py-2 rounded-lg shadow-md transition-all text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </form>
          <p className="text-center text-gray-400 mt-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </header>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-blue-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Calories</h2>
              <div className="p-2 bg-blue-700/30 rounded-full">
                <Flame size={24} className="text-blue-300" />
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {totals.calories.toFixed(0)} <span className="text-lg text-gray-400">/ {goals.daily_calories}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-blue-300">{caloriePercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${caloriePercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              <span className="font-medium text-white">{remainingCalories.toFixed(0)}</span> calories remaining
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-green-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Protein</h2>
              <div className="p-2 bg-green-700/30 rounded-full">
                <TrendingUp size={24} className="text-green-300" />
              </div>
            </div>
            <div className="text-4xl font-bold text-green-300 mb-2">
              {totals.protein.toFixed(0)}g <span className="text-lg text-gray-400">/ {goals.daily_protein}g</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-green-300">{proteinPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${proteinPercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              <span className="font-medium text-white">{remainingProtein.toFixed(0)}g</span> protein remaining
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-purple-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Summary</h2>
              <div className="p-2 bg-purple-700/30 rounded-full">
                <CalendarDays size={24} className="text-purple-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-800/30 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Entries</p>
                <p className="text-xl font-bold text-white">{safeEntries.length}</p>
              </div>
              <div className="bg-purple-800/30 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Meals</p>
                <p className="text-xl font-bold text-white">{mealCount}</p>
              </div>
              <div className="bg-purple-800/30 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Foods</p>
                <p className="text-xl font-bold text-white">{foodCount}</p>
              </div>
              <div className="bg-purple-800/30 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Cal/Protein Ratio</p>
                <p className="text-xl font-bold text-white">{totals.protein > 0 ? (totals.calories / totals.protein).toFixed(1) : '0'}</p>
              </div>
            </div>
            <Link 
              href="/nutrition-goals" 
              className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg shadow text-center transition-colors"
            >
              Update Goals
            </Link>
            <Link 
              href="/performance-view" 
              className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg shadow text-center transition-colors mt-4"
            >
              View Performance History
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Entry Section */}
          <div className="order-2 lg:order-1 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 text-center">Add New Entry</h2>
              <MealFormWrapper />
            </div>
            
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-gray-700/50 hidden lg:block">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              {safeEntries.length > 0 ? (
                <div className="space-y-4">
                  {safeEntries.slice(0, 3).map((entry) => (
                    <div key={`activity-${entry.id}`} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${entry.type === 'meal' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                      <div>
                        <p className="text-sm">{entry.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No entries yet for today.</p>
              )}
            </div>
          </div>
          
          {/* Entries List */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6">Today's Entries</h2>
              
              {safeEntries.length > 0 ? (
                <div className="space-y-4">
                  {safeEntries.map((item) => {
                    const calories =
                      item.type === 'meal'
                        ? item.calories || 0
                        : ((item.grams || 0) / 100) * (item.cal_per_100g || 0)

                    const protein =
                      item.type === 'meal'
                        ? item.protein || 0
                        : ((item.grams || 0) / 100) * (item.protein_per_100g || 0)

                    return (
                      <div key={item.id} className={`p-4 rounded-lg border ${
                        item.type === 'meal' 
                          ? 'bg-blue-900/20 border-blue-700/30' 
                          : 'bg-green-900/20 border-green-700/30'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center">
                              <span className={`text-xs px-2 py-0.5 rounded mr-2 ${
                                item.type === 'meal' 
                                  ? 'bg-blue-500/20 text-blue-300' 
                                  : 'bg-green-500/20 text-green-300'
                              }`}>
                                {item.type === 'meal' ? 'Meal' : 'Food'}
                              </span>
                              <h3 className="font-medium">{item.name}</h3>
                            </div>
                            
                            <div className="flex mt-2 space-x-4">
                              <div className="flex items-center">
                                <Flame size={16} className="text-blue-400 mr-1" />
                                <span className="text-sm">{calories.toFixed(1)} cal</span>
                              </div>
                              <div className="flex items-center">
                                <TrendingUp size={16} className="text-green-400 mr-1" />
                                <span className="text-sm">{protein.toFixed(1)}g protein</span>
                              </div>
                              {item.type === 'food' && (
                                <div className="text-sm text-gray-400">
                                  {item.grams}g ({item.cal_per_100g} cal/100g)
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <div className="text-xs text-gray-400 mb-2">
                              {new Date(item.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <EditDeleteButtons entry={item} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 mb-4">No entries yet for today.</p>
                  <p className="text-sm text-gray-500">Add your first meal or food item to start tracking!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}