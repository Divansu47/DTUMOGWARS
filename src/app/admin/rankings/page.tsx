import { createClient } from '@/lib/supabase/server'
import { AdminRankingsClient } from '@/components/admin/AdminRankingsClient'

export default async function AdminRankingsPage() {
  const supabase = createClient()

  const { data: profiles } = await supabase
    .from('profiles_with_rank')
    .select('*')
    .eq('status', 'approved')
    .order('rank', { ascending: true })

  return <AdminRankingsClient profiles={profiles ?? []} />
}
