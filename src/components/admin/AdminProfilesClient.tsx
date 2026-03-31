'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminProfilesClientProps {
  profiles: Profile[]
  currentStatus: string
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending', color: 'text-neon-amber' },
  { value: 'approved', label: 'Approved', color: 'text-neon-green' },
  { value: 'rejected', label: 'Rejected', color: 'text-neon-pink' },
  { value: 'all', label: 'All', color: 'text-prose' },
]

export function AdminProfilesClient({ profiles, currentStatus }: AdminProfilesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (
    profileId: string,
    action: 'approve' | 'reject' | 'toggle_visibility'
  ) => {
    setActionLoading(profileId + action)
    const supabase = createClient()

    let update: Record<string, any> = {}
    if (action === 'approve') update = { status: 'approved' }
    else if (action === 'reject') update = { status: 'rejected' }
    else if (action === 'toggle_visibility') {
      const profile = profiles.find(p => p.id === profileId)
      update = { is_visible: !profile?.is_visible }
    }

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', profileId)

    if (error) {
      toast.error('Action failed: ' + error.message)
    } else {
      toast.success('Profile updated')
      startTransition(() => router.refresh())
    }

    setActionLoading(null)
  }

  const handleDelete = async (profileId: string) => {
    if (!confirm('Permanently delete this profile? This cannot be undone.')) return
    setActionLoading(profileId + 'delete')
    const supabase = createClient()

    const { error } = await supabase.from('profiles').delete().eq('id', profileId)

    if (error) {
      toast.error('Delete failed')
    } else {
      toast.success('Profile deleted')
      startTransition(() => router.refresh())
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Status tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => router.push(`/admin/profiles?status=${tab.value}`)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              currentStatus === tab.value
                ? `${tab.color} bg-white/5 border-white/10`
                : 'text-dim border-border hover:border-muted hover:text-prose'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-dim text-sm font-mono">{profiles.length} profiles</p>

      {profiles.length === 0 ? (
        <div className="text-center py-16 text-dim">
          <p className="font-display font-semibold text-prose">No profiles in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-2xl border border-border p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
                    {profile.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm text-neon-cyan bg-neon-cyan/10">
                        {getInitials(profile.name)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-bright truncate">{profile.name}</span>
                      <span className={cn(
                        'badge text-xs',
                        profile.status === 'approved' ? 'badge-green' :
                        profile.status === 'pending' ? 'badge-amber' : 'badge-pink'
                      )}>
                        {profile.status}
                      </span>
                      {!profile.is_visible && (
                        <span className="badge text-xs bg-white/5 text-dim border border-border">hidden</span>
                      )}
                    </div>
                    <p className="text-dim text-xs font-mono mt-0.5">
                      {profile.branch} · Y{profile.year}
                    </p>
                    {profile.bio && (
                      <p className="text-prose text-xs mt-1 line-clamp-2 max-w-lg">{profile.bio}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {profile.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(profile.id, 'approve')}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium hover:bg-neon-green/20 transition-all"
                      >
                        {actionLoading === profile.id + 'approve' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(profile.id, 'reject')}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-medium hover:bg-neon-pink/20 transition-all"
                      >
                        {actionLoading === profile.id + 'reject' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        Reject
                      </button>
                    </>
                  )}

                  {profile.status === 'approved' && (
                    <button
                      onClick={() => handleAction(profile.id, 'toggle_visibility')}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border text-dim text-xs font-medium hover:text-bright hover:border-muted transition-all"
                    >
                      {profile.is_visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {profile.is_visible ? 'Hide' : 'Show'}
                    </button>
                  )}

                  {profile.status === 'rejected' && (
                    <button
                      onClick={() => handleAction(profile.id, 'approve')}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-medium hover:bg-neon-green/20 transition-all"
                    >
                      <CheckCircle className="w-3 h-3" /> Re-approve
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                  >
                    {actionLoading === profile.id + 'delete' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
