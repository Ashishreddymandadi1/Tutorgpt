import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()

  const [name, setName] = useState(user?.name ?? '')
  const [nameSuccess, setNameSuccess] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const nameMutation = useMutation({
    mutationFn: async () => (await api.put('/profile', { name })).data,
    onSuccess: (data) => {
      updateUser(data)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    },
  })

  const pwMutation = useMutation({
    mutationFn: async () => {
      await api.put('/profile/password', { currentPassword: currentPw, newPassword: newPw })
    },
    onSuccess: () => {
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    },
    onError: (err: any) => {
      setPwError(err?.response?.data?.message ?? 'Password change failed')
    },
  })

  function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    pwMutation.mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
        </div>

        {/* Profile */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Profile</h2>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled className="bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); nameMutation.mutate() }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={nameMutation.isPending || name === user?.name} className="rounded-xl">
                {nameMutation.isPending ? 'Saving…' : 'Save name'}
              </Button>
              {nameSuccess && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
            {nameMutation.isError && (
              <p className="text-sm text-red-600">Failed to update name. Please try again.</p>
            )}
          </form>
        </section>

        {/* Password */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Change Password</h2>
          <form onSubmit={handlePwSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                placeholder="Min. 8 characters"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm new password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>
            {pwError && <p className="text-sm text-red-600">{pwError}</p>}
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={pwMutation.isPending} className="rounded-xl">
                {pwMutation.isPending ? 'Updating…' : 'Update password'}
              </Button>
              {pwSuccess && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" /> Password updated
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Account info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Account Info</h2>
          <div className="space-y-2 text-sm">
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
        </section>
      </main>
    </div>
  )
}
