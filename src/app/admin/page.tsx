import { createClient } from '@/lib/supabase/server'
import { Users, Clock, CheckCircle, XCircle, MessageSquare, Vote } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: totalProfiles },
    { count: pendingProfiles },
    { count: approvedProfiles },
    { count: totalVotes },
    { count: totalComments },
    { data: recentPending },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('votes').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, name, branch, year, created_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Profiles', value: totalProfiles ?? 0, icon: Users, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
    { label: 'Pending Review', value: pendingProfiles ?? 0, icon: Clock, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/20' },
    { label: 'Approved', value: approvedProfiles ?? 0, icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
    { label: 'Total Votes', value: totalVotes ?? 0, icon: Vote, color: 'text-neon-violet', bg: 'bg-neon-violet/10', border: 'border-neon-violet/20' },
    { label: 'Comments', value: totalComments ?? 0, icon: MessageSquare, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`glass rounded-2xl border ${s.border} p-5`}>
            <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.border} border flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-dim text-xs font-mono mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending profiles */}
      {(pendingProfiles ?? 0) > 0 && (
        <div className="glass rounded-2xl border border-neon-amber/20 p-6">
          <h2 className="font-display font-semibold text-bright mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neon-amber" />
            Awaiting Review ({pendingProfiles})
          </h2>
          <div className="space-y-2">
            {recentPending?.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <span className="text-bright text-sm font-medium">{p.name}</span>
                  <span className="text-dim text-xs ml-2 font-mono">{p.branch} · Y{p.year}</span>
                </div>
                <a href="/admin/profiles" className="text-neon-amber text-xs hover:underline font-mono">Review →</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
