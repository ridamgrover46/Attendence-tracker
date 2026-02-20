'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, LogOut, TrendingUp, TrendingDown } from 'lucide-react'
import SubjectCard from '@/components/SubjectCard'
import AddSubjectModal from '@/components/AddSubjectModal'
import toast from 'react-hot-toast'

interface Subject {
  id: string
  user_id: string
  subject_name: string
  total_lectures: number
  attended_lectures: number
  created_at: string
}

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchUser()
    fetchSubjects()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
      return
    }
  }

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubjects(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAddSubject = async (subjectData: Omit<Subject, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          ...subjectData,
          user_id: user?.id,
        })
        .select()
        .single()

      if (error) throw error
      
      setSubjects([data, ...subjects])
      setShowAddModal(false)
      toast.success('Subject added successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setSubjects(subjects.map(subject => 
        subject.id === id ? data : subject
      ))
      toast.success('Subject updated successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSubjects(subjects.filter(subject => subject.id !== id))
      toast.success('Subject deleted successfully!')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const calculateOverallAttendance = () => {
    if (subjects.length === 0) return 0
    const totalAttended = subjects.reduce((sum, subject) => sum + subject.attended_lectures, 0)
    const totalLectures = subjects.reduce((sum, subject) => sum + subject.total_lectures, 0)
    return totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
              <p className="text-gray-600 mt-2">Manage your subject attendance efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center bg-gray-50 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-600">Overall Attendance</p>
                <p className={`text-2xl font-bold ${calculateOverallAttendance() >= 75 ? 'text-green-600' : calculateOverallAttendance() >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {calculateOverallAttendance()}%
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Subject</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="bg-gray-100 rounded-full h-24 w-24 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No subjects yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start tracking your attendance by adding your first subject. Monitor your progress and stay on top of your academic goals.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Subject</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onUpdate={handleUpdateSubject}
                onDelete={handleDeleteSubject}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddSubjectModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSubject}
        />
      )}
    </div>
  )
}
