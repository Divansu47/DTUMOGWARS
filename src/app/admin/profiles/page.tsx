import { createClient } from '@/lib/supabase/server'
import { AdminProfilesClient } from '@/components/admin/AdminProfilesClient'

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = createClient()

  const status = searchParams.status ?? 'pending'

  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data: profiles } = await query

  return (
    <AdminProfilesClient
      profiles={profiles ?? []}
      currentStatus={status}
    />
  )
}
