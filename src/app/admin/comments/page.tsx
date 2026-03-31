import { createClient } from '@/lib/supabase/server'
import { AdminCommentsClient } from '@/components/admin/AdminCommentsClient'

export default async function AdminCommentsPage() {
  const supabase = createClient()

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      id, content, created_at, is_hidden, author_id, profile_id,
      author:profiles!comments_author_id_fkey(name, avatar_url),
      profile:profiles!comments_profile_id_fkey(name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminCommentsClient comments={comments ?? []} />
}
