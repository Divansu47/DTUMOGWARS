import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: notifData } = await supabase
    .from('notifications')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="min-h-screen bg-void">
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 bg-neon-violet/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar
        userRole={userData?.role}
        unreadNotifications={notifData?.length ?? 0}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
