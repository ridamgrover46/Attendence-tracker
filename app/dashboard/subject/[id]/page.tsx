'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, FileText, TrendingUp, Users } from 'lucide-react'
import { supabase, Subject } from '@/lib/supabase'
import toast from 'react-hot-toast'
import SyllabusList from '@/components/SyllabusList'
import AssignmentList from '@/components/AssignmentList'

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'attendance' | 'syllabus' | 'assignments'>('attendance')

  useEffect(() => {
    fetchSubject()
  }, [subjectId])

  const fetchSubject = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single()

      if (error) throw error
      
      setSubject(data)
    } catch (error) {
      console.error('Error fetching subject:', error)
      toast.error('Failed to load subject')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const updateSubject = async (updates: Partial<Subject>) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', subjectId)

      if (error) throw error
      
      setSubject(prev => prev ? { ...prev, ...updates } : null)
    } catch (error) {
      console.error('Error updating subject:', error)
      toast.error('Failed to update subject')
    }
  }

  const markAttended = async () => {
    if (!subject) return
    await updateSubject({
      attended_lectures: subject.attended_lectures + 1,
      total_lectures: subject.total_lectures + 1
    })
    toast.success('Lecture marked as attended')
  }

  const markMissed = async () => {
    if (!subject) return
    await updateSubject({
      total_lectures: subject.total_lectures + 1
    })
    toast.success('Lecture marked as missed')
  }

  const attendancePercentage = subject?.total_lectures && subject.total_lectures > 0 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subject not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{subject.subject_name}</h1>
                <p className="text-blue-100">Subject Details & Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
                <div className="text-sm text-gray-600">Attendance</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{subject.attended_lectures}</div>
                <div className="text-sm text-gray-600">Attended</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 text-gray-600 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{subject?.total_lectures || 0}</div>
                <div className="text-sm text-gray-600">Total Lectures</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{(subject?.total_lectures || 0) - (subject?.attended_lectures || 0)}</div>
                <div className="text-sm text-gray-600">Missed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attendance Tracking
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'syllabus'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Syllabus
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assignments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Attendance Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Current Attendance</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getAttendanceColor(attendancePercentage)}`}>
                      {attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`${getProgressColor(attendancePercentage)} h-4 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 font-medium mb-1">Attended</p>
                    <p className="text-2xl font-bold text-green-700">{subject.attended_lectures}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 font-medium mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{subject.total_lectures}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={markAttended}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Mark Attended</span>
                  </button>
                  <button
                    onClick={markMissed}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Mark Missed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'syllabus' && (
            <SyllabusList subjectId={subjectId} />
          )}

          {activeTab === 'assignments' && (
            <AssignmentList subjectId={subjectId} />
          )}
        </div>
      </div>
    </div>
  )
}
