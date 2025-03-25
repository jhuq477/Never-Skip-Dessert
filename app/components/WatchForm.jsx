import { addWatch } from "../server-actions/addWatch";

export default function WatchForm() {
    return (
        <form action={addWatch} className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg">
        <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Brand</label>
            <input 
            type="text" 
            id="brand" 
            name="brand" 
            required 
            className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
        </div>

        <div className="mb-4">
            <label htmlFor="model" className="block text-sm font-medium text-gray-300">Model</label>
            <input 
            type="text" 
            id="model" 
            name="model" 
            required 
            className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
        </div>

        <div className="mb-4">
            <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-300">Reference Number</label>
            <input 
            type="text" 
            id="referenceNumber" 
            name="referenceNumber" 
            required 
            className="w-full mt-1 p-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
        </div>

        <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow-md transition-all">
            Add Watch
        </button>
        </form>
    )
}