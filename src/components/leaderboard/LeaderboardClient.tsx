'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Crown, Trophy, TrendingUp } from 'lucide-react'
import { Profile } from '@/lib/types'
import { cn, getInitials, getRankColor, getRankSuffix, formatScore } from '@/lib/utils'
import { VoteButtons } from '@/components/voting/VoteButtons'

interface LeaderboardClientProps {
  profiles: Profile[]
  userVotes: Record<string, 1 | -1>
  currentUserId?: string
  filters: { branch?: string; year?: string }
}

export function LeaderboardClient({ profiles, userVotes, currentUserId, filters }: LeaderboardClientProps) {
  const router = useRouter()
  const top3 = profiles.slice(0, 3)
  const rest = profiles.slice(3)

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams()
    if (filters.branch) params.set('branch', filters.branch)
    if (filters.year) params.set('year', filters.year)
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/leaderboard?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 badge-amber mb-3 font-mono text-xs">
          <Trophy className="w-3 h-3" /> LIVE RANKINGS
        </div>
        <h1 className="font-display font-extrabold text-4xl text-bright">MogWar Leaderboard</h1>
        <p className="text-dim text-sm mt-2">Rankings update after every vote</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {[undefined, '1', '2', '3', '4'].map(y => (
          <button
            key={y ?? 'all'}
            onClick={() => updateFilter('year', y)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-lg border transition-all font-mono',
              filters.year === y || (!filters.year && !y)
                ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                : 'border-border text-dim hover:border-muted hover:text-prose'
            )}
          >
            {y ? `Year ${y}` : 'All Years'}
          </button>
        ))}
      </div>

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 pt-4">
          {/* 2nd place */}
          {top3[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <PodiumCard profile={top3[1]} currentUserId={currentUserId} userVote={userVotes[top3[1].id] ?? null} />
              <div className="w-24 h-16 glass rounded-t-xl border border-rank-silver/30 flex items-center justify-center font-display font-bold text-rank-silver text-xl">
                2
              </div>
            </motion.div>
          )}

          {/* 1st place */}
          {top3[0] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center gap-3 -mb-0"
            >
              <div className="text-rank-gold animate-float">
                <Crown className="w-8 h-8" />
              </div>
              <PodiumCard profile={top3[0]} currentUserId={currentUserId} userVote={userVotes[top3[0].id] ?? null} isFirst />
              <div className="w-28 h-24 bg-rank-gold/10 border border-rank-gold/40 rounded-t-xl flex items-center justify-center font-display font-bold text-rank-gold text-2xl shadow-rank-gold animate-rank-glow">
                1
              </div>
            </motion.div>
          )}

          {/* 3rd place */}
          {top3[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-3"
            >
              <PodiumCard profile={top3[2]} currentUserId={currentUserId} userVote={userVotes[top3[2].id] ?? null} />
              <div className="w-24 h-10 glass rounded-t-xl border border-rank-bronze/30 flex items-center justify-center font-display font-bold text-rank-bronze text-xl">
                3
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of rankings */}
      {rest.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-dim" />
            <h2 className="font-display font-semibold text-prose text-sm">Full Rankings</h2>
          </div>

          {rest.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass rounded-xl border border-border hover:border-muted transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Rank */}
                <div className={cn('font-mono font-bold text-base w-8 text-right flex-shrink-0', getRankColor(profile.rank ?? 0))}>
                  {profile.rank}
                </div>

                {/* Avatar */}
                <Link href={`/p/${profile.id}`} className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-sm text-neon-cyan bg-neon-cyan/10">
                      {getInitials(profile.name)}
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/p/${profile.id}`}>
                    <p className="font-display font-semibold text-bright text-sm hover:text-neon-cyan transition-colors truncate">
                      {profile.name}
                    </p>
                  </Link>
                  <p className="text-dim text-xs font-mono truncate">
                    {profile.branch.split(' ').slice(0, 2).join(' ')} · Y{profile.year}
                  </p>
                </div>

                {/* Score */}
                <div className="font-mono font-bold text-sm text-neon-cyan flex-shrink-0">
                  {formatScore(profile.vote_score ?? 0)} pts
                </div>

                {/* Vote */}
                {currentUserId && currentUserId !== profile.user_id && (
                  <div className="flex-shrink-0 hidden sm:block">
                    <VoteButtons
                      profileId={profile.id}
                      currentVote={userVotes[profile.id] ?? null}
                      score={profile.vote_score ?? 0}
                      disabled={!currentUserId}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function PodiumCard({ profile, currentUserId, userVote, isFirst = false }: {
  profile: Profile
  currentUserId?: string
  userVote: 1 | -1 | null
  isFirst?: boolean
}) {
  return (
    <div className={cn(
      'glass rounded-2xl border p-4 flex flex-col items-center gap-2 w-36',
      isFirst ? 'border-rank-gold/40 shadow-rank-gold' : 'border-border'
    )}>
      <Link href={`/p/${profile.id}`}>
        <div className={cn(
          'relative w-14 h-14 rounded-xl overflow-hidden border-2',
          isFirst ? 'border-rank-gold' : 'border-border'
        )}>
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-neon-cyan bg-neon-cyan/10">
              {getInitials(profile.name)}
            </div>
          )}
        </div>
      </Link>
      <div className="text-center">
        <p className="font-display font-semibold text-bright text-xs truncate max-w-full">{profile.name}</p>
        <p className={cn('font-mono font-bold text-sm mt-0.5', isFirst ? 'text-rank-gold' : 'text-dim')}>
          {formatScore(profile.vote_score ?? 0)} pts
        </p>
      </div>
    </div>
  )
}
