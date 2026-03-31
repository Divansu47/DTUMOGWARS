import { createClient } from '@/lib/supabase/server'
import { ExploreClient } from '@/components/profile/ExploreClient'

export const revalidate = 60

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { branch?: string; year?: string; tag?: string; q?: string; sort?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('profiles_with_rank')
    .select('*')
    .eq('status', 'approved')
    .eq('is_visible', true)

  if (searchParams.branch) query = query.eq('branch', searchParams.branch)
  if (searchParams.year) query = query.eq('year', parseInt(searchParams.year))
  if (searchParams.tag) query = query.contains('strength_tags', [searchParams.tag])
  if (searchParams.q) query = query.ilike('name', `%${searchParams.q}%`)

  const sortBy = searchParams.sort ?? 'rank'
  if (sortBy === 'rank') query = query.order('rank', { ascending: true })
  else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
  else if (sortBy === 'score') query = query.order('vote_score', { ascending: false })

  query = query.limit(50)

  const { data: profiles } = await query

  // Get user votes for these profiles
  let userVotes: Record<string, 1 | -1> = {}
  if (user && profiles?.length) {
    const { data: votes } = await supabase
      .from('votes')
      .select('profile_id, value')
      .eq('voter_id', user.id)
      .in('profile_id', profiles.map(p => p.id))

    votes?.forEach(v => {
      userVotes[v.profile_id] = v.value as 1 | -1
    })
  }

  return (
    <ExploreClient
      initialProfiles={profiles ?? []}
      userVotes={userVotes}
      currentUserId={user?.id}
      filters={searchParams}
    />
  )
}
