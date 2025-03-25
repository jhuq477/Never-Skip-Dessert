'use client'

import { useState } from 'react'
import MealForm from './MealForm'

export default function MealFormWrapper() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
      {showForm ? (
        <>
          <MealForm />
          <button
            className="mt-4 text-sm text-gray-400 hover:underline"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow"
        >
          + Add Entry
        </button>
      )}
    </div>
  )
}
