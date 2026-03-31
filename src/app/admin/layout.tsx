import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Shield, Users, MessageSquare, Trophy, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/profiles', label: 'Profiles', icon: Users },
  { href: '/admin/comments', label: 'Comments', icon: MessageSquare },
  { href: '/admin/rankings', label: 'Rankings', icon: Trophy },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/explore')

  return (
    <div className="min-h-screen bg-void">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <Navbar userRole="admin" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Admin header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-neon-pink" />
          </div>
          <div>
            <h1 className="font-display font-bold text-bright">Admin Panel</h1>
            <p className="text-dim text-xs font-mono">Full moderation control</p>
          </div>
        </div>

        {/* Admin sub-nav */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border text-dim hover:text-bright hover:border-muted transition-all"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  )
}
