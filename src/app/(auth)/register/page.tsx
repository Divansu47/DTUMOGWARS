'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Optional: enforce DTU email domain
    // if (!email.endsWith('@dtu.ac.in')) {
    //   toast.error('Only DTU email addresses are allowed')
    //   return
    // }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Account created! Check your email to verify.')
    router.push('/profile')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-strong rounded-2xl p-8 border border-border shadow-card">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-neon-violet/10 border border-neon-violet/20 items-center justify-center mb-4">
            <UserPlus className="w-5 h-5 text-neon-violet" />
          </div>
          <h1 className="font-display font-bold text-2xl text-bright mb-1">Join MogWars</h1>
          <p className="text-dim text-sm">Create your DTU account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-prose mb-1.5 font-medium">DTU Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@dtu.ac.in"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-prose mb-1.5 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-prose"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-prose mb-1.5 font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm font-display transition-all duration-200 bg-neon-violet text-white hover:bg-neon-violet/90 hover:shadow-neon-violet active:scale-95 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-dim">
          Already have an account?{' '}
          <Link href="/login" className="text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors">
            Login
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
