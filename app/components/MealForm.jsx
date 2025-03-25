'use client'

import React, { useState } from 'react'
import { addEntry } from '../server-actions/addEntry'
import { PlusCircle, UtensilsCrossed, Apple } from 'lucide-react'

export default function MealForm() {
  const [type, setType] = useState('meal')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setMessage({ text: '', type: '' })
    
    try {
      const result = await addEntry(formData)
      
      if (result?.success) {
        setMessage({ text: 'Entry added successfully!', type: 'success' })
        // Reset form
        document.getElementById('entry-form').reset()
      } else {
        throw new Error(result?.error || 'Failed to add entry')
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setIsLoading(false)
      // Clear success message after 3 seconds
      if (message.type === 'success') {
        setTimeout(() => {
          setMessage({ text: '', type: '' })
        }, 3000)
      }
    }
  }

  return (
    <form
      id="entry-form"
      action={handleSubmit}
      className="space-y-5"
    >
      <div className="flex gap-4 justify-center mb-6">
        <button
          type="button"
          onClick={() => setType('meal')}
          className={`flex flex-col items-center py-3 px-5 rounded-lg border transition-all ${
            type === 'meal' 
              ? 'bg-blue-900/40 border-blue-500/60 text-blue-300' 
              : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800/70'
          }`}
        >
          <UtensilsCrossed size={24} className={type === 'meal' ? 'text-blue-400' : 'text-gray-500'} />
          <span className="text-sm mt-2">Meal</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('food')}
          className={`flex flex-col items-center py-3 px-5 rounded-lg border transition-all ${
            type === 'food' 
              ? 'bg-green-900/40 border-green-500/60 text-green-300' 
              : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800/70'
          }`}
        >
          <Apple size={24} className={type === 'food' ? 'text-green-400' : 'text-gray-500'} />
          <span className="text-sm mt-2">Food</span>
        </button>
      </div>

      <input type="hidden" name="type" value={type} />
      
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={`Enter ${type} name`}
        />
      </div>

      {type === 'meal' && (
        <>
          <div>
            <label
              htmlFor="calories"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Total Calories
            </label>
            <input
              type="number"
              name="calories"
              id="calories"
              required
              min="0"
              step="0.1"
              className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter calories"
            />
          </div>
          <div>
            <label
              htmlFor="protein"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Total Protein (g)
            </label>
            <input
              type="number"
              name="protein"
              id="protein"
              required
              min="0"
              step="0.1"
              className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter protein in grams"
            />
          </div>
        </>
      )}

      {type === 'food' && (
        <>
          <div>
            <label
              htmlFor="grams"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Amount Consumed (g)
            </label>
            <input
              type="number"
              name="grams"
              id="grams"
              required
              min="0"
              step="0.1"
              className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter amount in grams"
            />
          </div>
          <div>
            <label
              htmlFor="cal_per_100g"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Calories per 100g
            </label>
            <input
              type="number"
              name="cal_per_100g"
              id="cal_per_100g"
              required
              min="0"
              step="0.1"
              className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Calories per 100g"
            />
          </div>
          <div>
            <label
              htmlFor="protein_per_100g"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Protein per 100g
            </label>
            <input
              type="number"
              name="protein_per_100g"
              id="protein_per_100g"
              required
              min="0"
              step="0.1"
              className="w-full p-3 bg-gray-700/50 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Protein per 100g"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-gradient-to-r ${
          type === 'meal' 
            ? 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
            : 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
        } text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 flex items-center justify-center ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <span>Adding...</span>
        ) : (
          <>
            <PlusCircle size={18} className="mr-2" />
            Add {type === 'meal' ? 'Meal' : 'Food'}
          </>
        )}
      </button>
      
      {message.text && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          message.type === 'success' 
            ? 'bg-green-900/40 border border-green-600 text-green-200' 
            : 'bg-red-900/40 border border-red-600 text-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </form>
  )
}