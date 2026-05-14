import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, BookOpen, Brain, BarChart2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">TutorGPT</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {user?.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">What would you like to study today?</p>
        </div>

        {/* Feature cards — placeholders for upcoming phases */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
            title="My Courses"
            description="Upload materials and start a course"
            badge="Phase 3"
          />
          <FeatureCard
            icon={<Brain className="h-6 w-6 text-purple-600" />}
            title="AI Tutor"
            description="Chat with your documents"
            badge="Phase 4"
          />
          <FeatureCard
            icon={<BarChart2 className="h-6 w-6 text-green-600" />}
            title="Analytics"
            description="Track your learning progress"
            badge="Phase 6"
          />
        </div>

        {/* Account info */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Account
          </h2>
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

function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode
  title: string
  description: string
  badge: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      <span className="inline-block text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
        Coming in {badge}
      </span>
    </div>
  )
}
