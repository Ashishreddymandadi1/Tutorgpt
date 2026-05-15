import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Settings, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import TutorGPTLogo from '@/components/TutorGPTLogo'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Courses', path: '/courses' },
  ]

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-6 sticky top-0 z-40">
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <TutorGPTLogo size={32} textSize="sm" />
      </button>

      {/* Nav links */}
      <nav className="hidden sm:flex items-center gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); navigate('/settings') }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
