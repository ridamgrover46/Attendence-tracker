'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddSubjectModalProps {
  onClose: () => void
  onAdd: (subject: Omit<any, 'id' | 'user_id' | 'created_at'>) => void
}

export default function AddSubjectModal({ onClose, onAdd }: AddSubjectModalProps) {
  const [subjectName, setSubjectName] = useState('')
  const [totalLectures, setTotalLectures] = useState('')
  const [attendedLectures, setAttendedLectures] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subjectName.trim()) {
      return
    }

    const total = parseInt(totalLectures) || 0
    const attended = parseInt(attendedLectures) || 0

    if (attended > total) {
      return
    }

    setLoading(true)
    
    await onAdd({
      subject_name: subjectName.trim(),
      total_lectures: total,
      attended_lectures: attended,
    })
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add New Subject</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name
            </label>
            <input
              type="text"
              id="subjectName"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="e.g., Mathematics"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalLectures" className="block text-sm font-medium text-gray-700 mb-2">
                Total Lectures
              </label>
              <input
                type="number"
                id="totalLectures"
                value={totalLectures}
                onChange={(e) => setTotalLectures(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="attendedLectures" className="block text-sm font-medium text-gray-700 mb-2">
                Attended Lectures
              </label>
              <input
                type="number"
                id="attendedLectures"
                value={attendedLectures}
                onChange={(e) => setAttendedLectures(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {parseInt(attendedLectures) > parseInt(totalLectures) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              Attended lectures cannot be more than total lectures
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !subjectName.trim() || parseInt(attendedLectures) > parseInt(totalLectures)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Subject</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
