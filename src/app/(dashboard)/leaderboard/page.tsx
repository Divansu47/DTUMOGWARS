import { createClient } from '@/lib/supabase/server'
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient'

export const revalidate = 30

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { branch?: string; year?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('profiles_with_rank')
    .select('*')
    .eq('status', 'approved')
    .eq('is_visible', true)
    .order('rank', { ascending: true })
    .limit(100)

  if (searchParams.branch) query = query.eq('branch', searchParams.branch)
  if (searchParams.year) query = query.eq('year', parseInt(searchParams.year))

  const { data: profiles } = await query

  let userVotes: Record<string, 1 | -1> = {}
  if (user && profiles?.length) {
    const { data: votes } = await supabase
      .from('votes')
      .select('profile_id, value')
      .eq('voter_id', user.id)
      .in('profile_id', profiles.map(p => p.id))
    votes?.forEach(v => { userVotes[v.profile_id] = v.value as 1 | -1 })
  }

  return (
    <LeaderboardClient
      profiles={profiles ?? []}
      userVotes={userVotes}
      currentUserId={user?.id}
      filters={searchParams}
    />
  )
}
