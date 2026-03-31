'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/explore'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push(redirect)
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="glass-strong rounded-2xl p-8 border border-border shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 items-center justify-center mb-4">
            <LogIn className="w-5 h-5 text-neon-cyan" />
          </div>
          <h1 className="font-display font-bold text-2xl text-bright mb-1">Welcome Back</h1>
          <p className="text-dim text-sm">Login to your MogWars account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Enter the Arena'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-dim">
          No account yet?{' '}
          <Link href="/register" className="text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors">
            Create your card
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
