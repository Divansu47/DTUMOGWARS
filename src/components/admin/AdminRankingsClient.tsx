'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Edit2, Check, X, RefreshCw, Loader2 } from 'lucide-react'
import { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials, getRankColor, getRankSuffix, formatScore } from '@/lib/utils'
import toast from 'react-hot-toast'

export function AdminRankingsClient({ profiles }: { profiles: Profile[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [recomputing, setRecomputing] = useState(false)

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id)
    setEditScore((profile.admin_score_override ?? profile.vote_score ?? 0).toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditScore('')
  }

  const saveOverride = async (profileId: string) => {
    const score = parseInt(editScore)
    if (isNaN(score)) {
      toast.error('Enter a valid number')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ admin_score_override: score })
      .eq('id', profileId)

    if (error) {
      toast.error('Failed to save override')
    } else {
      toast.success('Score override saved — rankings will recompute')
      setEditingId(null)
      startTransition(() => router.refresh())
    }
    setSaving(false)
  }

  const clearOverride = async (profileId: string) => {
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ admin_score_override: null })
      .eq('id', profileId)

    if (error) toast.error('Failed')
    else {
      toast.success('Override cleared')
      startTransition(() => router.refresh())
    }
    setSaving(false)
  }

  const recomputeAll = async () => {
    setRecomputing(true)
    const supabase = createClient()
    const { error } = await supabase.rpc('recompute_rankings')
    if (error) toast.error('Recompute failed')
    else {
      toast.success('Rankings recomputed!')
      startTransition(() => router.refresh())
    }
    setRecomputing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-dim text-sm font-mono">{profiles.length} ranked profiles</p>
        <button
          onClick={recomputeAll}
          disabled={recomputing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-neon-violet/30 text-neon-violet bg-neon-violet/10 hover:bg-neon-violet/20 transition-all"
        >
          {recomputing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Recompute All Rankings
        </button>
      </div>

      <div className="space-y-2">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="glass rounded-xl border border-border p-4"
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className={cn('font-mono font-bold text-base w-8 text-right flex-shrink-0', getRankColor(profile.rank ?? 0))}>
                {getRankSuffix(profile.rank ?? 0)}
              </div>

              {/* Avatar */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface border border-border flex-shrink-0">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm text-neon-cyan bg-neon-cyan/10">
                    {getInitials(profile.name)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-bright text-sm truncate">{profile.name}</p>
                <p className="text-dim text-xs font-mono">{profile.branch.split(' ').slice(0, 2).join(' ')} · Y{profile.year}</p>
              </div>

              {/* Score display */}
              <div className="text-right flex-shrink-0">
                <div className="font-mono font-bold text-sm text-neon-cyan">
                  {formatScore(profile.vote_score ?? 0)} pts
                </div>
                {profile.admin_score_override !== null && profile.admin_score_override !== undefined && (
                  <div className="text-xs text-neon-amber font-mono">
                    override: {profile.admin_score_override}
                  </div>
                )}
              </div>

              {/* Edit controls */}
              <div className="flex-shrink-0">
                {editingId === profile.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editScore}
                      onChange={e => setEditScore(e.target.value)}
                      className="w-20 input-field py-1.5 px-2 text-sm text-center"
                      autoFocus
                    />
                    <button
                      onClick={() => saveOverride(profile.id)}
                      disabled={saving}
                      className="p-1.5 rounded-lg text-neon-green hover:bg-neon-green/10 transition-all"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg text-dim hover:text-neon-pink transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(profile)}
                      className="p-1.5 rounded-lg text-dim hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                      title="Override score"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {profile.admin_score_override !== null && profile.admin_score_override !== undefined && (
                      <button
                        onClick={() => clearOverride(profile.id)}
                        className="p-1.5 rounded-lg text-dim hover:text-neon-pink hover:bg-neon-pink/5 transition-all text-xs font-mono"
                        title="Clear override"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
