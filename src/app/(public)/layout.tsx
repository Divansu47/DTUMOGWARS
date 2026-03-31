import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: string | undefined
  if (user) {
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    userRole = data?.role
  }

  return (
    <div className="min-h-screen bg-void">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <Navbar userRole={userRole} />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
