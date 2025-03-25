'use client'

import { useState } from "react"
import { updateWatch } from "../server-actions/updateWatch";


export default function EditWatch({watch}){

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        brand: watch.brand,
        model: watch.model,
        referenceNumber: watch.reference_number
    })

    //take all the formdata spread into new formdata but then set new input name as the value of the input
    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value})
    return (
        <div>
        <button 
            onClick={() => setShowModal(true)} 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg shadow-md transition-all"
        >
            Edit
        </button>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md relative">
                {/* Close Button */}
                <span 
                onClick={() => setShowModal(false)} 
                className="absolute top-3 right-4 text-gray-400 text-2xl cursor-pointer hover:text-gray-200"
                >
                &times;
                </span>

                {/* Form */}
                <form action={updateWatch} onSubmit={() => setShowModal(false)} className="space-y-4">
                    <input type="hidden" name="id" value={watch.id} />

                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Brand</label>
                        <input 
                        type="text" 
                        id="brand" 
                        name="brand" 
                        value={formData.brand} 
                        onChange={handleChange} 
                        className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-300">Model</label>
                        <input 
                        type="text" 
                        id="model" 
                        name="model" 
                        value={formData.model} 
                        onChange={handleChange} 
                        className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-300">Reference Number</label>
                        <input 
                        type="text" 
                        id="referenceNumber" 
                        name="referenceNumber" 
                        value={formData.referenceNumber} 
                        onChange={handleChange} 
                        className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg shadow-md transition-all"
                    >
                        Update Watch
                    </button>
                </form>
            </div>
            </div>
        )}
        </div>
    )
}