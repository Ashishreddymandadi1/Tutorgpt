import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import CoursesPage from '@/pages/CoursesPage'
import CoursePage from '@/pages/CoursePage'
import QuizPage from '@/pages/QuizPage'
import FlashcardsPage from '@/pages/FlashcardsPage'
import SettingsPage from '@/pages/SettingsPage'
import PrivateRoute from '@/components/PrivateRoute'
import { useAuthStore } from '@/store/authStore'

interface HealthResponse {
  status: string
  service: string
  version: string
  ai_service: { status: string }
}

async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>('/api/health')
  return data
}

function HealthPage() {
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    retry: 1,
  })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const allHealthy = data?.status === 'ok' && data?.ai_service?.status === 'ok'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">TutorGPT</h1>
          <p className="text-gray-500 text-sm">System Health</p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-gray-500 text-sm">Checking services…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-red-700 font-medium">Backend unreachable</p>
          </div>
        )}

        {data && (
          <>
            <div className="space-y-4 mb-8">
              <ServiceRow name="Frontend" description="React + Vite" status="ok" />
              <ServiceRow name="Backend" description={`Spring Boot · v${data.version}`} status={data.status} />
              <ServiceRow name="AI Service" description="FastAPI · Python" status={data.ai_service?.status ?? 'unreachable'} />
            </div>
            <div className={`rounded-xl p-4 text-center font-semibold text-lg ${allHealthy ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
              {allHealthy ? '✓ All systems healthy' : '⚠ Some services are down'}
            </div>
          </>
        )}

        <button onClick={() => refetch()} className="mt-6 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Refresh
        </button>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const ok = status === 'ok'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <span className={`h-2 w-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {ok ? 'Healthy' : 'Unreachable'}
    </span>
  )
}

function ServiceRow({ name, description, status }: { name: string; description: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div>
        <p className="font-medium text-gray-900 text-sm">{name}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={<PrivateRoute><DashboardPage /></PrivateRoute>}
      />
      <Route
        path="/courses"
        element={<PrivateRoute><CoursesPage /></PrivateRoute>}
      />
      <Route
        path="/courses/:id"
        element={<PrivateRoute><CoursePage /></PrivateRoute>}
      />
      <Route
        path="/courses/:id/quiz/:quizId"
        element={<PrivateRoute><QuizPage /></PrivateRoute>}
      />
      <Route
        path="/courses/:id/deck/:deckId"
        element={<PrivateRoute><FlashcardsPage /></PrivateRoute>}
      />
      <Route
        path="/settings"
        element={<PrivateRoute><SettingsPage /></PrivateRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
