import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles_with_rank')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'approved')
    .eq('is_visible', true)
    .single()

  if (!profile) notFound()

  // Get user's vote on this profile
  let userVote: 1 | -1 | null = null
  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('value')
      .eq('voter_id', user.id)
      .eq('profile_id', profile.id)
      .single()
    userVote = (vote?.value ?? null) as 1 | -1 | null
  }

  // Get comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id, content, created_at, author_id,
      author:profiles!comments_author_id_fkey(name, avatar_url, course, year)
    `)
    .eq('profile_id', profile.id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <ProfilePageClient
      profile={profile}
      comments={comments ?? []}
      currentUserId={user?.id}
      userVote={userVote}
    />
  )
}
