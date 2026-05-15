import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import { BookOpen, FileText, Brain, BarChart2, ClipboardList, Layers } from 'lucide-react'
import api from '@/services/api'

interface Stats {
  courseCount: number
  documentCount: number
  quizCount: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/stats')).data,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">What would you like to study today?</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={<BookOpen className="h-5 w-5 text-indigo-500" />} label="Courses" value={stats?.courseCount ?? 0} color="indigo" />
          <StatCard icon={<FileText className="h-5 w-5 text-blue-500" />} label="Documents" value={stats?.documentCount ?? 0} color="blue" />
          <StatCard icon={<Brain className="h-5 w-5 text-violet-500" />} label="Quizzes taken" value={stats?.quizCount ?? 0} color="violet" />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
            title="My Courses"
            description="Upload and manage study material"
            onClick={() => navigate('/courses')}
            color="indigo"
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-purple-600" />}
            title="AI Chat"
            description="Ask questions about your documents"
            onClick={() => navigate('/courses')}
            color="purple"
          />
          <FeatureCard
            icon={<ClipboardList className="h-6 w-6 text-violet-600" />}
            title="Quizzes"
            description="Test your knowledge with AI quizzes"
            onClick={() => navigate('/courses')}
            color="violet"
          />
          <FeatureCard
            icon={<Layers className="h-6 w-6 text-teal-600" />}
            title="Flashcards"
            description="Study with AI flashcard decks"
            onClick={() => navigate('/courses')}
            color="teal"
          />
        </div>

        {/* Account card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account</h2>
            <button
              onClick={() => navigate('/settings')}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Edit settings →
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-900 font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Member since</span>
              <span className="text-gray-900 font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'indigo' | 'blue' | 'violet' }) {
  const bg = { indigo: 'bg-indigo-50', blue: 'bg-blue-50', violet: 'bg-violet-50' }[color]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description, onClick, color }: {
  icon: React.ReactNode; title: string; description: string; onClick?: () => void
  color: 'indigo' | 'purple' | 'violet' | 'teal'
}) {
  const border = { indigo: 'hover:border-indigo-200', purple: 'hover:border-purple-200', violet: 'hover:border-violet-200', teal: 'hover:border-teal-200' }[color]
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-sm transition-all ${border}`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}
