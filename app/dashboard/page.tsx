'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, BookOpen, FileText, AlertCircle, TrendingUp } from 'lucide-react'
import { supabase, Subject, Assignment, SyllabusTopic } from '@/lib/supabase'
import toast from 'react-hot-toast'
import SubjectCard from '@/components/SubjectCard'
import AddSubjectModal from '@/components/AddSubjectModal'

export default function DashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    overdueAssignments: 0,
    totalSyllabusTopics: 0,
    completedSyllabusTopics: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchUser()
    fetchSubjects()
  }, [])

  useEffect(() => {
    fetchDashboardStats()
  }, [user])

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      // Get all subjects for the user
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id')
        .eq('user_id', user.id)

      const subjectIds = subjectsData?.map(s => s.id) || []

      if (subjectIds.length === 0) {
        setStats({
          totalSubjects: 0,
          totalAssignments: 0,
          pendingAssignments: 0,
          overdueAssignments: 0,
          totalSyllabusTopics: 0,
          completedSyllabusTopics: 0
        })
        return
      }

      // Get assignments stats
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('status, deadline')
        .in('subject_id', subjectIds)

      // Get syllabus topics stats
      const { data: syllabusData } = await supabase
        .from('syllabus_topics')
        .select('is_completed')
        .in('subject_id', subjectIds)

      const today = new Date()
      const pendingAssignments = assignmentsData?.filter(a => 
        a.status === 'pending' && new Date(a.deadline) >= today
      ) || []
      
      const overdueAssignments = assignmentsData?.filter(a => 
        a.status === 'pending' && new Date(a.deadline) < today
      ) || []

      const completedTopics = syllabusData?.filter(t => t.is_completed) || []

      setStats({
        totalSubjects: subjectIds.length,
        totalAssignments: assignmentsData?.length || 0,
        pendingAssignments: pendingAssignments.length,
        overdueAssignments: overdueAssignments.length,
        totalSyllabusTopics: syllabusData?.length || 0,
        completedSyllabusTopics: completedTopics.length
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-blue-100">Manage your subjects and track progress</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Subjects</p>
                <p className="text-3xl font-bold">{stats.totalSubjects}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Assignments</p>
                <p className="text-3xl font-bold">{stats.totalAssignments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Assignments</p>
                <p className="text-3xl font-bold">{stats.pendingAssignments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Overdue Assignments</p>
                <p className="text-3xl font-bold">{stats.overdueAssignments}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Syllabus Progress</p>
                <p className="text-3xl font-bold">
                  {stats.totalSyllabusTopics > 0 
                    ? Math.round((stats.completedSyllabusTopics / stats.totalSyllabusTopics) * 100)
                    : 0}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Completed Topics</p>
                <p className="text-3xl font-bold">{stats.completedSyllabusTopics}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-200" />
            </div>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Attendance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {subjects.length > 0 
                  ? Math.round(
                      subjects.reduce((acc, subject) => acc + (subject.total_lectures > 0 
                        ? (subject.attended_lectures / subject.total_lectures) * 100 
                        : 0), 0) / subjects.length
                    )
                  : 0}%
              </div>
              <p className="text-sm text-gray-600">Average Attendance</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {subjects.reduce((acc, subject) => acc + subject.attended_lectures, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Attended</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {subjects.reduce((acc, subject) => acc + subject.total_lectures, 0)}
              </div>
              <p className="text-sm text-gray-600">Total Lectures</p>
            </div>
          </div>
        </div>

        {/* Add Subject Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Subjects</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Add Subject</span>
          </button>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-gray-600 mb-6">Add your first subject to start tracking attendance</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add Your First Subject
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

      {/* Add Subject Modal */}
      {showAddModal && (
        <AddSubjectModal
          onClose={() => setShowAddModal(false)}
          onSubjectAdded={handleAddSubject}
        />
      )}
    </div>
  )
}
