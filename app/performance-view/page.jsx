'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Flame, Calendar as CalendarIcon } from 'lucide-react'

export default function PerformanceView() {
  const [timeRange, setTimeRange] = useState('week') // 'week', 'month', '3months'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Navigate through time periods
  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (timeRange === '3months') {
      newDate.setMonth(newDate.getMonth() - 3)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (timeRange === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else if (timeRange === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (timeRange === '3months') {
      newDate.setMonth(newDate.getMonth() + 3)
    }
    
    // Don't allow navigating into the future beyond today
    if (newDate <= new Date()) {
      setCurrentDate(newDate)
    }
  }

  // Format date range for display
  const getDateRangeText = () => {
    const options = { month: 'short', day: 'numeric' }
    
    if (timeRange === 'week') {
      const startDate = new Date(currentDate)
      startDate.setDate(startDate.getDate() - 6) // 7 days including current date
      return `${startDate.toLocaleDateString('en-US', options)} - ${currentDate.toLocaleDateString('en-US', options)}`
    } else if (timeRange === 'month') {
      const year = currentDate.getFullYear()
      const month = currentDate.toLocaleString('en-US', { month: 'long' })
      return `${month} ${year}`
    } else if (timeRange === '3months') {
      const endDate = new Date(currentDate)
      const startDate = new Date(currentDate)
      startDate.setMonth(startDate.getMonth() - 2)
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} - ${endDate.toLocaleDateString('en-US', { month: 'short' })} ${endDate.getFullYear()}`
    }
  }

  // Fetch performance data based on the selected time range and date
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true)
      
      try {
        // Calculate date range
        let startDate = new Date(currentDate)
        if (timeRange === 'week') {
          startDate.setDate(startDate.getDate() - 6) // Get 7 days (including the current day)
        } else if (timeRange === 'month') {
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        } else if (timeRange === '3months') {
          startDate.setMonth(startDate.getMonth() - 2)
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
        }
        
        // Reset hours to get the full day
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(currentDate)
        endDate.setHours(23, 59, 59, 999)
        
        // Get user goals
        const { data: { user } } = await supabase.auth.getUser()
        const { data: userGoals } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', user.id)
          .single()
          
        const { data: entries, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true })
          
        if (error) {
          throw error
        }
        
        // Process data based on time range
        let processedData = []
        
        if (timeRange === 'week') {
          // Group by day
          const dateGroups = {}
          
          for (let i = 0; i <= 6; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            dateGroups[dateStr] = {
              date: dateStr,
              displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
              calories: 0,
              protein: 0,
              entriesCount: 0,
              goalCalories: userGoals?.daily_calories || 2000,
              goalProtein: userGoals?.daily_protein || 150
            }
          }
          
          entries.forEach(entry => {
            const dateStr = new Date(entry.created_at).toISOString().split('T')[0]
            
            if (dateGroups[dateStr]) {
              let calories = 0
              let protein = 0
              
              if (entry.type === 'meal') {
                calories = entry.calories || 0
                protein = entry.protein || 0
              } else if (entry.type === 'food') {
                calories = ((entry.grams || 0) / 100) * (entry.cal_per_100g || 0)
                protein = ((entry.grams || 0) / 100) * (entry.protein_per_100g || 0)
              }
              
              dateGroups[dateStr].calories += calories
              dateGroups[dateStr].protein += protein
              dateGroups[dateStr].entriesCount += 1
            }
          })
          
          processedData = Object.values(dateGroups)
        } else if (timeRange === 'month' || timeRange === '3months') {
          // Group by week or by day depending on the range
          const periodGroups = {}
          
          if (timeRange === 'month') {
            // Get all days in the month
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            
            for (let i = 1; i <= daysInMonth; i++) {
              const date = new Date(year, month, i)
              const dateStr = date.toISOString().split('T')[0]
              periodGroups[dateStr] = {
                date: dateStr,
                displayDate: date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
                calories: 0,
                protein: 0,
                entriesCount: 0,
                goalCalories: userGoals?.daily_calories || 2000,
                goalProtein: userGoals?.daily_protein || 150
              }
            }
          } else {
            // Get all weeks in the 3-month period
            const startMonth = startDate.getMonth()
            
            for (let m = 0; m < 3; m++) {
              const month = new Date(startDate.getFullYear(), startMonth + m, 1)
              const monthName = month.toLocaleDateString('en-US', { month: 'short' })
              
              // For 3-month view, group by week
              // Divide each month into 4 weeks
              for (let w = 1; w <= 4; w++) {
                const weekKey = `${monthName}-W${w}`
                periodGroups[weekKey] = {
                  date: weekKey,
                  displayDate: `${monthName} W${w}`,
                  calories: 0,
                  protein: 0,
                  entriesCount: 0,
                  daysWithEntries: 0,
                  goalCalories: (userGoals?.daily_calories || 2000) * 7, // Weekly goals
                  goalProtein: (userGoals?.daily_protein || 150) * 7
                }
              }
            }
          }
          
          // Process entries
          if (timeRange === 'month') {
            // Daily view for month
            entries.forEach(entry => {
              const dateStr = new Date(entry.created_at).toISOString().split('T')[0]
              
              if (periodGroups[dateStr]) {
                let calories = 0
                let protein = 0
                
                if (entry.type === 'meal') {
                  calories = entry.calories || 0
                  protein = entry.protein || 0
                } else if (entry.type === 'food') {
                  calories = ((entry.grams || 0) / 100) * (entry.cal_per_100g || 0)
                  protein = ((entry.grams || 0) / 100) * (entry.protein_per_100g || 0)
                }
                
                periodGroups[dateStr].calories += calories
                periodGroups[dateStr].protein += protein
                periodGroups[dateStr].entriesCount += 1
              }
            })
          } else {
            // Weekly view for 3 months
            // Group entries by day first
            const entriesByDay = {}
            
            entries.forEach(entry => {
              const entryDate = new Date(entry.created_at)
              const dateStr = entryDate.toISOString().split('T')[0]
              
              if (!entriesByDay[dateStr]) {
                entriesByDay[dateStr] = {
                  calories: 0,
                  protein: 0,
                  count: 0
                }
              }
              
              let calories = 0
              let protein = 0
              
              if (entry.type === 'meal') {
                calories = entry.calories || 0
                protein = entry.protein || 0
              } else if (entry.type === 'food') {
                calories = ((entry.grams || 0) / 100) * (entry.cal_per_100g || 0)
                protein = ((entry.grams || 0) / 100) * (entry.protein_per_100g || 0)
              }
              
              entriesByDay[dateStr].calories += calories
              entriesByDay[dateStr].protein += protein
              entriesByDay[dateStr].count += 1
            })
            
            // Now assign days to weeks
            Object.entries(entriesByDay).forEach(([dateStr, dayData]) => {
              const entryDate = new Date(dateStr)
              const monthName = entryDate.toLocaleDateString('en-US', { month: 'short' })
              const dayOfMonth = entryDate.getDate()
              
              // Determine which week of the month
              let weekNum = Math.ceil(dayOfMonth / 7)
              if (weekNum > 4) weekNum = 4 // Cap at 4 weeks
              
              const weekKey = `${monthName}-W${weekNum}`
              
              if (periodGroups[weekKey]) {
                periodGroups[weekKey].calories += dayData.calories
                periodGroups[weekKey].protein += dayData.protein
                periodGroups[weekKey].entriesCount += dayData.count
                periodGroups[weekKey].daysWithEntries += 1
              }
            })
          }
          
          processedData = Object.values(periodGroups)
        }
        
        setPerformanceData(processedData)
      } catch (error) {
        console.error('Error fetching performance data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPerformanceData()
  }, [timeRange, currentDate, supabase])
  
  // Calculate trends and statistics
  const getTrends = () => {
    if (performanceData.length === 0) return { calorieAvg: 0, proteinAvg: 0, consistency: 0 }
    
    const totalCalories = performanceData.reduce((sum, day) => sum + day.calories, 0)
    const totalProtein = performanceData.reduce((sum, day) => sum + day.protein, 0)
    const daysWithEntries = performanceData.filter(day => day.calories > 0 || day.protein > 0).length
    
    return {
      calorieAvg: totalCalories / daysWithEntries || 0,
      proteinAvg: totalProtein / daysWithEntries || 0,
      consistency: (daysWithEntries / performanceData.length) * 100
    }
  }
  
  const trends = getTrends()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            Performance Tracking
          </h1>
          <p className="text-center text-gray-400 mt-2">
            Analyze your nutrition trends over time
          </p>
        </header>
        
        {/* Time Range Control */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg p-4 backdrop-blur-sm border border-gray-700/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={navigatePrevious}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon size={20} className="text-blue-400" />
                  <span className="font-medium">{getDateRangeText()}</span>
                </div>
                
                <button 
                  onClick={navigateNext}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
                >
                  <ChevronRight size={20} className={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) ? 'text-gray-500' : 'text-white'} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 rounded-lg transition-colors ${timeRange === 'week' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 rounded-lg transition-colors ${timeRange === 'month' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('3months')}
                  className={`px-4 py-2 rounded-lg transition-colors ${timeRange === '3months' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
                >
                  3 Months
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-blue-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Avg. Calories</h2>
              <div className="p-2 bg-blue-700/30 rounded-full">
                <Flame size={24} className="text-blue-300" />
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {trends.calorieAvg.toFixed(0)}
            </div>
            <p className="text-sm text-gray-400">
              {performanceData.length > 0 ? `Based on ${performanceData.filter(day => day.calories > 0).length} tracked days` : 'No data for this period'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-green-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Avg. Protein</h2>
              <div className="p-2 bg-green-700/30 rounded-full">
                <TrendingUp size={24} className="text-green-300" />
              </div>
            </div>
            <div className="text-4xl font-bold text-green-300 mb-2">
              {trends.proteinAvg.toFixed(0)}g
            </div>
            <p className="text-sm text-gray-400">
              {performanceData.length > 0 ? `Based on ${performanceData.filter(day => day.protein > 0).length} tracked days` : 'No data for this period'}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-purple-700/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Consistency</h2>
              <div className="p-2 bg-purple-700/30 rounded-full">
                <Calendar size={24} className="text-purple-300" />
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-300 mb-2">
              {trends.consistency.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-400">
              {performanceData.length > 0 ? `${performanceData.filter(day => day.calories > 0 || day.protein > 0).length} out of ${performanceData.length} days tracked` : 'No data for this period'}
            </p>
          </div>
        </div>
        
        {/* Charts */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl shadow-lg p-6 backdrop-blur-sm border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-6">Nutrition Over Time</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : performanceData.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">No data available for this time period</p>
                <p className="text-sm text-gray-500">Try a different date range or start tracking your nutrition</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Calories Chart */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-300">Calories</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fill: '#aaa', fontSize: 12 }} 
                          tickMargin={10}
                        />
                        <YAxis tick={{ fill: '#aaa' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Legend />
                        <Bar dataKey="calories" name="Calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        {timeRange !== '3months' && (
                          <Bar dataKey="goalCalories" name="Target" fill="#1e40af" radius={[4, 4, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Protein Chart */}
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-300">Protein</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="displayDate" 
                          tick={{ fill: '#aaa', fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis tick={{ fill: '#aaa' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Legend />
                        <Bar dataKey="protein" name="Protein (g)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        {timeRange !== '3months' && (
                          <Bar dataKey="goalProtein" name="Target" fill="#15803d" radius={[4, 4, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Trends Line Chart */}
                {timeRange === 'month' && (
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-300">Weekly Averages</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis 
                            dataKey="displayDate" 
                            tick={{ fill: '#aaa', fontSize: 12 }}
                            tickMargin={10}
                            interval={6} // Show weekly markers
                          />
                          <YAxis tick={{ fill: '#aaa' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#94a3b8' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="calories" name="Calories (7-day avg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="protein" name="Protein (7-day avg)" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <Link 
            href="/meal-board" 
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg inline-flex items-center transition-all"
          >
            <span className="mr-2">←</span> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}