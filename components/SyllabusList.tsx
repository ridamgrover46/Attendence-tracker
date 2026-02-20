'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, X, BookOpen } from 'lucide-react'
import { supabase, SyllabusTopic } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface SyllabusListProps {
  subjectId: string
}

export default function SyllabusList({ subjectId }: SyllabusListProps) {
  const [topics, setTopics] = useState<SyllabusTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [newTopic, setNewTopic] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchTopics()
  }, [subjectId])

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('syllabus_topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setTopics(data || [])
    } catch (error) {
      console.error('Error fetching topics:', error)
      toast.error('Failed to load syllabus topics')
    } finally {
      setLoading(false)
    }
  }

  const addTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.trim()) return

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to add topics')
        return
      }

      const { data, error } = await supabase
        .from('syllabus_topics')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          topic_title: newTopic.trim(),
          is_completed: false
        })
        .select()
        .single()

      if (error) throw error
      
      setTopics([...topics, data])
      setNewTopic('')
      setShowAddForm(false)
      toast.success('Topic added successfully')
    } catch (error) {
      console.error('Error adding topic:', error)
      toast.error('Failed to add topic')
    }
  }

  const toggleTopicComplete = async (topicId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('syllabus_topics')
        .update({ is_completed: !isCompleted })
        .eq('id', topicId)

      if (error) throw error

      setTopics(topics.map(topic => 
        topic.id === topicId 
          ? { ...topic, is_completed: !isCompleted }
          : topic
      ))
      
      toast.success(isCompleted ? 'Topic marked as incomplete' : 'Topic marked as complete')
    } catch (error) {
      console.error('Error updating topic:', error)
      toast.error('Failed to update topic')
    }
  }

  const deleteTopic = async (topicId: string) => {
    try {
      const { error } = await supabase
        .from('syllabus_topics')
        .delete()
        .eq('id', topicId)

      if (error) throw error

      setTopics(topics.filter(topic => topic.id !== topicId))
      toast.success('Topic deleted')
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete topic')
    }
  }

  const completedCount = topics.filter(topic => topic.is_completed).length
  const completionPercentage = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Syllabus Progress</h3>
              <p className="text-sm text-gray-600">{completedCount} of {topics.length} topics completed</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Add Topic Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Syllabus Topics</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Add Topic</span>
        </button>
      </div>

      {/* Add Topic Form */}
      {showAddForm && (
        <form onSubmit={addTopic} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter topic title..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setNewTopic('')
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* Topics List */}
      <div className="space-y-2">
        {topics.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No syllabus topics yet</p>
            <p className="text-sm text-gray-400">Add your first topic to get started</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                topic.is_completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={topic.is_completed}
                onChange={() => toggleTopicComplete(topic.id, topic.is_completed)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className={`flex-1 ${
                topic.is_completed 
                  ? 'line-through text-gray-500' 
                  : 'text-gray-900'
              }`}>
                {topic.topic_title}
              </span>
              <button
                onClick={() => deleteTopic(topic.id)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
