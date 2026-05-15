import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import Navbar from '@/components/Navbar'
import api from '@/services/api'

interface Course {
  id: number
  name: string
  description: string
  createdAt: string
  documentCount: number
}

export default function CoursesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => (await api.get('/courses')).data,
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/courses', { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setShowCreate(false)
      setName('')
      setDescription('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Courses</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Course
        </Button>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-4">
        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Create new course</h2>
                <form
                  onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="cname">Course name</Label>
                    <Input
                      id="cname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Biology 101"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cdesc">Description (optional)</Label>
                    <Input
                      id="cdesc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this course about?"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating…' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No courses yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first course to get started</p>
            <Button className="mt-6" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> New Course
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer group"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{course.name}</p>
                <p className="text-sm text-gray-500">
                  {course.documentCount} document{course.documentCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(course.id) }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
