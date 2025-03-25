'use client'

import { useState } from 'react'
import { deleteEntry } from '../server-actions/deleteEntry'
import { editEntry } from '../server-actions/editEntry'
import { Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react'

export default function EditDeleteButtons({ entry }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: entry.id,
    type: entry.type,
    name: entry.name,
    calories: entry.calories || '',
    protein: entry.protein || '',
    grams: entry.grams || '',
    cal_per_100g: entry.cal_per_100g || '',
    protein_per_100g: entry.protein_per_100g || ''
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })
    
    try {
      const result = await editEntry(formDataToSend)
      if (result.success) {
        setIsEditing(false)
      } else {
        console.error('Failed to update:', result.error)
      }
    } catch (error) {
      console.error('Error updating entry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    setIsSubmitting(true)
    
    const formDataToSend = new FormData()
    formDataToSend.append('id', entry.id)
    
    try {
      const result = await deleteEntry(formDataToSend)
      if (!result.success) {
        console.error('Failed to delete:', result.error)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }
  
  if (isEditing) {
    return (
      <form onSubmit={handleUpdate} className="mt-2 space-y-3 border border-gray-700 rounded-lg p-3 bg-gray-800/50">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
          />
        </div>
        
        {entry.type === 'meal' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
                />
              </div>
            </div>
          </>
        )}
        
        {entry.type === 'food' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Amount (g)</label>
              <input
                type="number"
                name="grams"
                value={formData.grams}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cal/100g</label>
                <input
                  type="number"
                  name="cal_per_100g"
                  value={formData.cal_per_100g}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Protein/100g</label>
                <input
                  type="number"
                  name="protein_per_100g"
                  value={formData.protein_per_100g}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm"
                />
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={14} />
          </button>
          <button
            type="submit"
            className="flex items-center justify-center p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? '...' : <Check size={14} />}
          </button>
        </div>
      </form>
    )
  }
  
  if (showDeleteConfirm) {
    return (
      <div className="mt-2 border border-red-600/30 rounded-lg p-3 bg-red-900/20">
        <div className="flex items-center gap-2 mb-2 text-red-300">
          <AlertCircle size={16} />
          <p className="text-xs">Delete this entry?</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex gap-1">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 bg-gray-700 hover:bg-blue-600 text-gray-400 hover:text-white rounded transition-colors"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="p-1.5 bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white rounded transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}