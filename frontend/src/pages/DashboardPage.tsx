import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, BookOpen, Brain, BarChart2, FileText, Brain as BrainIcon } from 'lucide-react'
import api from '@/services/api'

interface Stats {
  courseCount: number
  documentCount: number
  quizCount: number
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/stats')).data,
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">TutorGPT</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">What would you like to study today?</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
            label="Courses"
            value={stats?.courseCount ?? 0}
            color="indigo"
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            label="Documents"
            value={stats?.documentCount ?? 0}
            color="blue"
          />
          <StatCard
            icon={<BrainIcon className="h-5 w-5 text-violet-500" />}
            label="Quizzes taken"
            value={stats?.quizCount ?? 0}
            color="violet"
          />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
            title="My Courses"
            description="Upload materials and start a course"
            onClick={() => navigate('/courses')}
            badge="Open →"
            badgeColor="indigo"
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-purple-600" />}
            title="AI Tutor"
            description="Chat with your documents"
            onClick={() => navigate('/courses')}
            badge="Open →"
            badgeColor="purple"
          />
          <FeatureCard
            icon={<BarChart2 className="h-6 w-6 text-green-600" />}
            title="Analytics"
            description="Track your learning progress"
            badge={`${stats?.quizCount ?? 0} quiz${stats?.quizCount !== 1 ? 'zes' : ''} taken`}
            badgeColor="green"
          />
        </div>

        {/* Account info */}
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Account</h2>
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
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'indigo' | 'blue' | 'violet'
}) {
  const bg = { indigo: 'bg-indigo-50', blue: 'bg-blue-50', violet: 'bg-violet-50' }[color]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function FeatureCard({
  icon, title, description, onClick, badge, badgeColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  badge?: string
  badgeColor?: 'indigo' | 'purple' | 'green'
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-700',
  }
  const cls = badgeColor ? colors[badgeColor] : 'bg-gray-100 text-gray-500'
  return (
    <div
      className={`bg-white rounded-2xl border p-6 transition-shadow ${onClick ? 'border-gray-200 hover:shadow-md cursor-pointer' : 'border-gray-100'}`}
      onClick={onClick}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      {badge && (
        <span className={`inline-block text-xs rounded-full px-2.5 py-0.5 font-medium ${cls}`}>
          {badge}
        </span>
      )}
    </div>
  )
}
