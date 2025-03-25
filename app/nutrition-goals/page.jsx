'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { saveNutritionGoals } from '../server-actions/saveNutritionGoals'
import { Activity, Calculator, ChevronDown, Info, Dumbbell } from 'lucide-react'

export default function NutritionGoalsPage() {
  // Add proteinMultiplier to formData
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '', // in kg
    height: '', // in cm
    activityLevel: 'moderate',
    goal: 'maintain',
    proteinMultiplier: 1.6 // Default protein multiplier
  })

  const [results, setResults] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [openSection, setOpenSection] = useState('personal')
  
  // Protein multiplier explanations
  const proteinLevels = {
    '1.0': { label: 'Minimum (1.0g/kg)', description: 'Basic protein needs for sedentary individuals' },
    '1.2': { label: 'Low (1.2g/kg)', description: 'For general health and light activity' },
    '1.6': { label: 'Moderate (1.6g/kg)', description: 'For regular exercise and muscle maintenance' },
    '1.8': { label: 'High (1.8g/kg)', description: 'For intense training and muscle building' },
    '2.2': { label: 'Maximum (2.2g/kg)', description: 'For serious athletes and bodybuilders' }
  }

  const activityLevels = {
    sedentary: { label: 'Sedentary (little or no exercise)', factor: 1.2 },
    light: { label: 'Lightly active (1-3 days/week)', factor: 1.375 },
    moderate: { label: 'Moderately active (3-5 days/week)', factor: 1.55 },
    active: { label: 'Very active (6-7 days/week)', factor: 1.725 },
    extreme: { label: 'Extremely active (physical job + training)', factor: 1.9 }
  }

  const goalFactors = {
    'lose-fast': { label: 'Lose weight quickly (1kg/week)', factor: 0.8 },
    'lose-moderate': { label: 'Lose weight moderately (0.5kg/week)', factor: 0.9 },
    'maintain': { label: 'Maintain weight', factor: 1 },
    'gain-moderate': { label: 'Gain weight moderately (0.25kg/week)', factor: 1.1 },
    'gain-fast': { label: 'Gain weight quickly (0.5kg/week)', factor: 1.2 }
  }

  // Set recommended protein multiplier based on goal
  useEffect(() => {
    let recommendedMultiplier = 1.6; // default
    
    if (formData.goal.includes('lose')) {
      recommendedMultiplier = 1.8; // higher protein for weight loss to preserve muscle
    } else if (formData.goal.includes('gain')) {
      recommendedMultiplier = 2.2; // higher protein for muscle building
    } else {
      recommendedMultiplier = 1.6; // maintenance
    }
    
    // Only update if the user hasn't manually changed it
    setFormData(prev => ({
      ...prev,
      proteinMultiplier: recommendedMultiplier
    }));
  }, [formData.goal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const calculateNutrition = (e) => {
    e.preventDefault()
    
    // Convert string inputs to numbers
    const age = parseInt(formData.age)
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    const activityFactor = activityLevels[formData.activityLevel].factor
    const goalFactor = goalFactors[formData.goal].factor
    const proteinMultiplier = parseFloat(formData.proteinMultiplier)
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityFactor
    
    // Apply goal adjustment
    const adjustedCalories = Math.round(tdee * goalFactor)
    
    // Calculate protein needs based on user-selected multiplier
    const proteinNeeds = Math.round(weight * proteinMultiplier)
    
    // Calculate protein range (for display purposes)
    const minProtein = Math.round(weight * 1.0)  // Minimum recommended
    const maxProtein = Math.round(weight * 2.2)  // Maximum recommended
    
    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: adjustedCalories,
      dailyProtein: proteinNeeds,
      proteinRange: {
        min: minProtein,
        max: maxProtein,
        selected: proteinNeeds
      }
    })
    
    // Auto-open the results section
    setOpenSection('results')
  }

  const handleSaveGoals = async () => {
    if (!results) return

    setIsSaving(true)
    setErrorMessage('')
    
    try {
      const formData = new FormData()
      formData.append('dailyCalories', results.dailyCalories)
      formData.append('dailyProtein', results.dailyProtein)
      
      const result = await saveNutritionGoals(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setSuccessMessage('Nutrition goals saved successfully!')
      
      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error saving goals:', error)
      setErrorMessage('Failed to save goals. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
            Nutrition Goals Calculator
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Calculate your personalized nutrition targets based on your body metrics and fitness goals
          </p>
        </header>
        
        <div className="max-w-2xl mx-auto">
          {/* Collapsible Sections */}
          <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg backdrop-blur-sm border border-gray-700/50">
            <button 
              onClick={() => setOpenSection(openSection === 'personal' ? '' : 'personal')}
              className="w-full flex items-center justify-between p-4 text-left border-b border-gray-700/50"
            >
              <div className="flex items-center">
                <div className="bg-blue-600/30 p-2 rounded-lg mr-3">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <ChevronDown 
                size={20} 
                className={`transform transition-transform ${openSection === 'personal' ? 'rotate-180' : ''}`} 
              />
            </button>
            
            <div className={`transition-all duration-300 ${openSection === 'personal' ? 'max-h-[1000px] py-6 px-4' : 'max-h-0 overflow-hidden'}`}>
              <form onSubmit={calculateNutrition} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="15"
                      max="100"
                      required
                      className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your age"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="30"
                      max="300"
                      step="0.1"
                      required
                      className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your weight"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      min="100"
                      max="250"
                      step="0.1"
                      required
                      className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Enter your height"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-300 mb-1">
                    Activity Level
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {Object.entries(activityLevels).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-1">
                    Goal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    {Object.entries(goalFactors).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Protein Multiplier Section */}
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="proteinMultiplier" className="block text-sm font-medium text-gray-300 mb-1">
                      Protein Target (g per kg of bodyweight)
                    </label>
                    <div className="tooltip relative group">
                      <Info size={16} className="text-gray-400" />
                      <span className="tooltip-text invisible absolute z-10 w-64 bg-gray-800 text-white text-xs rounded p-2 right-0 -bottom-36 opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                        <p className="mb-1 font-medium">Protein intake recommendations:</p>
                        <p>• 1.0g/kg: Minimum for sedentary individuals</p>
                        <p>• 1.6-1.8g/kg: Optimal for most active people</p>
                        <p>• 2.0-2.2g/kg: For muscle building and serious training</p>
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">1.0g/kg</span>
                      <span className="text-sm text-gray-400">2.2g/kg</span>
                    </div>
                    
                    <input
                      type="range"
                      id="proteinMultiplier"
                      name="proteinMultiplier"
                      min="1.0"
                      max="2.2"
                      step="0.2"
                      value={formData.proteinMultiplier}
                      onChange={handleInputChange}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    
                    <div className="mt-4 flex items-center">
                      <div className="bg-blue-600/30 p-2 rounded-lg mr-3">
                        <Dumbbell size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-300">
                          {formData.proteinMultiplier}g per kg
                          {formData.weight && ` (${Math.round(formData.weight * formData.proteinMultiplier)}g total)`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {proteinLevels[formData.proteinMultiplier] 
                            ? proteinLevels[formData.proteinMultiplier].description
                            : 'Custom protein target'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all flex items-center"
                  >
                    <Calculator size={18} className="mr-2" />
                    Calculate Nutrition Needs
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Results Section */}
          {results && (
            <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg backdrop-blur-sm border border-gray-700/50">
              <button 
                onClick={() => setOpenSection(openSection === 'results' ? '' : 'results')}
                className="w-full flex items-center justify-between p-4 text-left border-b border-gray-700/50"
              >
                <div className="flex items-center">
                  <div className="bg-green-600/30 p-2 rounded-lg mr-3">
                    <Calculator size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Your Nutrition Results</h2>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`transform transition-transform ${openSection === 'results' ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div className={`transition-all duration-300 ${openSection === 'results' ? 'max-h-[1000px] py-6 px-4' : 'max-h-0 overflow-hidden'}`}>
                <div className="p-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-green-500/20 mb-6">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/90 rounded-lg">
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">Basal Metabolic Rate</h3>
                        <div className="tooltip relative group">
                          <Info size={16} className="text-gray-400" />
                          <span className="tooltip-text invisible absolute z-10 w-48 bg-gray-800 text-white text-xs rounded p-2 -left-24 -bottom-20 opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                            Calories your body needs at complete rest to maintain basic functions
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{results.bmr} calories</p>
                    </div>
                    
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-300">Total Daily Energy</h3>
                        <div className="tooltip relative group">
                          <Info size={16} className="text-gray-400" />
                          <span className="tooltip-text invisible absolute z-10 w-48 bg-gray-800 text-white text-xs rounded p-2 -left-24 -bottom-20 opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity">
                            Calories needed based on your BMR and daily activity level
                          </span>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">{results.tdee} calories</p>
                    </div>
                    
                    <div className="relative col-span-2 mt-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg opacity-20"></div>
                      <div className="relative bg-gray-800/90 rounded-lg p-6 flex flex-col items-center">
                        <h3 className="text-center font-semibold text-lg mb-6">Your Recommended Daily Targets</h3>
                        
                        <div className="grid grid-cols-2 gap-8 w-full">
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-blue-700/30 border border-blue-500/40 mb-3">
                              <span className="text-3xl font-bold text-blue-300">{results.dailyCalories}</span>
                            </div>
                            <p className="text-center text-sm font-medium">Calories per day</p>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500/30 to-green-700/30 border border-green-500/40 mb-3">
                              <span className="text-3xl font-bold text-green-300">{results.dailyProtein}g</span>
                            </div>
                            <p className="text-center text-sm font-medium">Protein per day</p>
                          </div>
                        </div>
                        
                        {/* Protein Range Display */}
                        <div className="mt-6 w-full bg-gray-700/30 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-300 flex items-center">
                              <Dumbbell size={16} className="mr-2 text-green-400" />
                              Protein Intake Range
                            </h3>
                            <span className="text-xs text-gray-400">Based on your bodyweight of {formData.weight}kg</span>
                          </div>
                          
                          <div className="relative pt-6 pb-2">
                            {/* Background bar */}
                            <div className="absolute h-2 w-full bg-gray-600 rounded-full"></div>
                            
                            {/* Range indicator */}
                            <div 
                              className="absolute h-2 bg-gradient-to-r from-green-600/60 to-green-400/60 rounded-full"
                              style={{ 
                                left: `${(results.proteinRange.min / (results.proteinRange.max * 1.1)) * 100}%`, 
                                width: `${((results.proteinRange.max - results.proteinRange.min) / (results.proteinRange.max * 1.1)) * 100}%` 
                              }}
                            ></div>
                            
                            {/* Selected point */}
                            <div 
                              className="absolute w-4 h-4 bg-green-400 rounded-full -mt-1 -ml-2 border-2 border-gray-800"
                              style={{ 
                                left: `${(results.proteinRange.selected / (results.proteinRange.max * 1.1)) * 100}%`,
                                top: '0px'
                              }}
                            ></div>
                            
                            {/* Min label */}
                            <div 
                              className="absolute text-xs text-gray-400"
                              style={{ left: `${(results.proteinRange.min / (results.proteinRange.max * 1.1)) * 100}%`, top: '-20px' }}
                            >
                              {results.proteinRange.min}g
                            </div>
                            
                            {/* Max label */}
                            <div 
                              className="absolute text-xs text-gray-400"
                              style={{ left: `${(results.proteinRange.max / (results.proteinRange.max * 1.1)) * 100}%`, top: '-20px' }}
                            >
                              {results.proteinRange.max}g
                            </div>
                            
                            {/* Selected label */}
                            <div 
                              className="absolute text-xs text-white font-medium"
                              style={{ 
                                left: `${(results.proteinRange.selected / (results.proteinRange.max * 1.1)) * 100}%`,
                                top: '12px'
                              }}
                            >
                              {results.proteinRange.selected}g
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-6">
                            The recommended range for daily protein intake is {results.proteinRange.min}g-{results.proteinRange.max}g based on your weight. 
                            You've selected {formData.proteinMultiplier}g/kg ({results.proteinRange.selected}g total).
                          </p>
                        </div>
                        
                        <button
                          onClick={handleSaveGoals}
                          disabled={isSaving}
                          className={`mt-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSaving ? 'Saving...' : 'Save These Goals'}
                        </button>
                        
                        {successMessage && (
                          <div className="mt-4 p-2 bg-green-600/40 border border-green-500 text-white text-center rounded-lg w-full">
                            {successMessage}
                          </div>
                        )}
                        
                        {errorMessage && (
                          <div className="mt-4 p-2 bg-red-600/40 border border-red-500 text-white text-center rounded-lg w-full">
                            {errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Link 
              href="/meal-board" 
              className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg inline-flex items-center transition-all"
            >
              <span className="mr-2">←</span> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )};