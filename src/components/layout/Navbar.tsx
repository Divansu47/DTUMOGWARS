'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Compass, Trophy, User, LogOut, Bell,
  Shield, Menu, X, Zap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'My Card', icon: User },
]

interface NavbarProps {
  userRole?: string
  unreadNotifications?: number
}

export function Navbar({ userRole, unreadNotifications = 0 }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Logged out')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'glass border-b border-border' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/explore" className="flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-neon-cyan" />
            <span className="font-display font-extrabold text-lg text-bright">DTU</span>
            <span className="font-display font-extrabold text-lg gradient-text-cyan">MogWars</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname.startsWith(href)
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                    : 'text-dim hover:text-bright hover:bg-elevated'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {userRole === 'admin' && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname.startsWith('/admin')
                    ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/20'
                    : 'text-dim hover:text-neon-pink hover:bg-neon-pink/5'
                )}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/profile" className="relative p-2 rounded-xl text-dim hover:text-bright hover:bg-elevated transition-all">
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full" />
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-dim hover:text-neon-pink hover:bg-neon-pink/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-dim hover:text-bright"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong border-b border-border p-4"
          >
            <div className="flex flex-col gap-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname.startsWith(href)
                      ? 'bg-neon-cyan/10 text-neon-cyan'
                      : 'text-prose hover:text-bright hover:bg-elevated'
                  )}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
              {userRole === 'admin' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-prose hover:text-neon-pink hover:bg-neon-pink/5 transition-all"
                >
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-prose hover:text-neon-pink hover:bg-neon-pink/5 transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
