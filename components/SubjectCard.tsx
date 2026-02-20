'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, TrendingUp, TrendingDown, Edit2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Subject {
  id: string
  user_id: string
  subject_name: string
  total_lectures: number
  attended_lectures: number
  created_at: string
}

interface SubjectCardProps {
  subject: Subject
  onUpdate: (id: string, updates: Partial<Subject>) => void
  onDelete: (id: string) => void
}

export default function SubjectCard({ subject, onUpdate, onDelete }: SubjectCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(subject.subject_name)
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictN, setPredictN] = useState(1)
  const [predictionType, setPredictionType] = useState<'attend' | 'miss'>('attend')

  const attendancePercentage = subject.total_lectures > 0 
    ? Math.round((subject.attended_lectures / subject.total_lectures) * 100)
    : 0

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleMarkAttended = () => {
    onUpdate(subject.id, {
      attended_lectures: subject.attended_lectures + 1,
      total_lectures: subject.total_lectures + 1
    })
  }

  const handleMarkMissed = () => {
    onUpdate(subject.id, {
      total_lectures: subject.total_lectures + 1
    })
  }

  const handleEdit = () => {
    if (editName.trim() === '') {
      toast.error('Subject name cannot be empty')
      return
    }
    onUpdate(subject.id, { subject_name: editName.trim() })
    setIsEditing(false)
  }

  const calculatePrediction = () => {
    if (predictionType === 'attend') {
      const newAttended = subject.attended_lectures + predictN
      const newTotal = subject.total_lectures + predictN
      return Math.round((newAttended / newTotal) * 100)
    } else {
      const newTotal = subject.total_lectures + predictN
      return Math.round((subject.attended_lectures / newTotal) * 100)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button
                onClick={handleEdit}
                className="text-green-600 hover:text-green-700 p-1"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditName(subject.subject_name)
                }}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 truncate">{subject.subject_name}</h3>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(subject.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700">Attendance</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getAttendanceColor(attendancePercentage)}`}>
            {attendancePercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getProgressColor(attendancePercentage)} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-green-600 font-medium mb-1">Attended</p>
          <p className="text-xl font-bold text-green-700">{subject.attended_lectures}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 font-medium mb-1">Total</p>
          <p className="text-xl font-bold text-gray-900">{subject.total_lectures}</p>
        </div>
      </div>

      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleMarkAttended}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Attended</span>
        </button>
        <button
          onClick={handleMarkMissed}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <Minus className="h-4 w-4" />
          <span className="text-sm font-medium">Missed</span>
        </button>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setIsPredicting(!isPredicting)}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
        >
          {isPredicting ? 'Hide' : 'Show'} Attendance Prediction
        </button>
        
        {isPredicting && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={predictionType}
                onChange={(e) => setPredictionType(e.target.value as 'attend' | 'miss')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="attend">Attend next</option>
                <option value="miss">Miss next</option>
              </select>
              <input
                type="number"
                min="1"
                max="50"
                value={predictN}
                onChange={(e) => setPredictN(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-center"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">lectures</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Predicted attendance:</span>
                <span className={`font-semibold px-2 py-1 rounded-full border ${getAttendanceColor(calculatePrediction())}`}>
                  {calculatePrediction()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${getProgressColor(calculatePrediction())} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(calculatePrediction(), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
