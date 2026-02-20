'use client'

import { useState, useEffect } from 'react'
import { Calendar, AlertCircle, CheckCircle, Clock, FileText, Plus, Trash2 } from 'lucide-react'
import { supabase, Assignment } from '@/lib/supabase'
import toast from 'react-hot-toast'
import AssignmentForm from './AssignmentForm'

interface AssignmentListProps {
  subjectId: string
}

export default function AssignmentList({ subjectId }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchAssignments()
  }, [subjectId])

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('subject_id', subjectId)
        .order('deadline', { ascending: true })

      if (error) throw error
      setAssignments(data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const toggleAssignmentStatus = async (assignmentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
      const { error } = await supabase
        .from('assignments')
        .update({ status: newStatus })
        .eq('id', assignmentId)

      if (error) throw error

      setAssignments(assignments.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: newStatus as 'pending' | 'completed' }
          : assignment
      ))
      
      toast.success(newStatus === 'completed' ? 'Assignment marked as complete' : 'Assignment marked as pending')
    } catch (error) {
      console.error('Error updating assignment:', error)
      toast.error('Failed to update assignment')
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error

      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId))
      toast.success('Assignment deleted')
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  const getAssignmentStatus = (assignment: Assignment) => {
    const today = new Date()
    const deadline = new Date(assignment.deadline)
    const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (assignment.status === 'completed') {
      return {
        label: 'Completed',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle,
        urgent: false
      }
    }

    if (daysRemaining < 0) {
      return {
        label: 'Overdue',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertCircle,
        urgent: true
      }
    }

    if (daysRemaining <= 3) {
      return {
        label: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock,
        urgent: true
      }
    }

    return {
      label: `${daysRemaining} days left`,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: Calendar,
      urgent: false
    }
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length
  const overdueCount = assignments.filter(a => {
    const today = new Date()
    const deadline = new Date(a.deadline)
    return a.status === 'pending' && deadline < today
  }).length

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
              <div className="text-xs text-gray-600">Total Assignments</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-600 text-white p-2 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Assignment Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Assignment</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No assignments yet</p>
            <p className="text-sm text-gray-400">Add your first assignment to get started</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const status = getAssignmentStatus(assignment)
            const StatusIcon = status.icon

            return (
              <div
                key={assignment.id}
                className={`bg-white rounded-lg border p-4 transition-all ${
                  status.urgent ? 'border-red-200 shadow-sm' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{assignment.title}</h4>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDeadline(assignment.deadline)}</span>
                      </div>
                      <div className={`flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-full border ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        <span>{status.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleAssignmentStatus(assignment.id, assignment.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        assignment.status === 'completed'
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Assignment Form Modal */}
      {showAddForm && (
        <AssignmentForm
          subjectId={subjectId}
          onAssignmentAdded={(newAssignment) => {
            setAssignments([...assignments, newAssignment])
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}
