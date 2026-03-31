import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LandingHero } from '@/components/layout/LandingHero'
import { LandingLeaderboardPreview } from '@/components/layout/LandingLeaderboardPreview'
import { LandingFeatures } from '@/components/layout/LandingFeatures'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/explore')

  // Fetch top 3 for preview
  const { data: topProfiles } = await supabase
    .from('profiles_with_rank')
    .select('id, name, avatar_url, branch, year, vote_score, rank, strength_tags')
    .eq('status', 'approved')
    .eq('is_visible', true)
    .order('rank', { ascending: true })
    .limit(3)

  return (
    <main className="min-h-screen bg-void noise-overlay">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/8 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-display font-800 text-xl text-bright">DTU</span>
          <span className="font-display font-800 text-xl gradient-text-cyan">MogWars</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm px-4 py-2">Login</Link>
          <Link href="/register" className="btn-primary text-sm px-4 py-2">Join the War</Link>
        </div>
      </nav>

      <LandingHero />
      <LandingLeaderboardPreview profiles={topProfiles ?? []} />
      <LandingFeatures />

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-dim text-sm font-mono mt-20">
        <p>© 2024 DTU MogWars — Built for the students, by the students of Delhi Technological University</p>
      </footer>
    </main>
  )
}
