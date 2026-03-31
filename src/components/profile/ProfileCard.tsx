'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Crown, Instagram, Linkedin, Github, Twitter, Share2, ExternalLink } from 'lucide-react'
import { Profile, STRENGTH_TAG_LABELS, BADGE_LABELS } from '@/lib/types'
import { cn, getInitials, getRankColor, getRankGlow, getRankSuffix, formatScore } from '@/lib/utils'
import { VoteButtons } from '@/components/voting/VoteButtons'

interface ProfileCardProps {
  profile: Profile
  currentUserId?: string
  userVote?: 1 | -1 | null
  compact?: boolean
  showVote?: boolean
}

export function ProfileCard({
  profile,
  currentUserId,
  userVote,
  compact = false,
  showVote = true,
}: ProfileCardProps) {
  const isOwnProfile = currentUserId === profile.user_id
  const rank = profile.rank ?? 0
  const score = profile.vote_score ?? 0

  const handleShare = async () => {
    const url = `${window.location.origin}/p/${profile.id}`
    if (navigator.share) {
      await navigator.share({ title: `${profile.name} on DTU MogWars`, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass card-shine rounded-2xl border overflow-hidden transition-all duration-300 shadow-card hover:shadow-card-hover',
        getRankGlow(rank)
      )}
    >
      {/* Cover / Header */}
      <div className="relative h-24 bg-gradient-to-br from-neon-cyan/10 via-neon-violet/10 to-neon-pink/10 overflow-hidden">
        {profile.cover_url && (
          <Image src={profile.cover_url} alt="cover" fill className="object-cover opacity-40" />
        )}
        {/* Rank badge */}
        {rank > 0 && (
          <div className={cn(
            'absolute top-3 right-3 font-mono font-bold text-sm px-2.5 py-1 rounded-lg glass border',
            rank === 1
              ? 'text-rank-gold border-rank-gold/40 bg-rank-gold/10 animate-rank-glow'
              : rank <= 3
                ? 'text-rank-silver border-rank-silver/30 bg-rank-silver/10'
                : rank <= 10
                  ? 'text-rank-bronze border-rank-bronze/20 bg-rank-bronze/10'
                  : 'text-dim border-border'
          )}>
            {rank === 1 && <Crown className="inline w-3 h-3 mr-1" />}
            {getRankSuffix(rank)}
          </div>
        )}
        {/* Score */}
        <div className="absolute bottom-3 right-3 font-mono text-xs text-dim">
          {formatScore(score)} pts
        </div>
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-8 mb-3">
        <div className={cn(
          'relative w-16 h-16 rounded-2xl overflow-hidden border-2 bg-surface',
          rank === 1 ? 'border-rank-gold' : rank <= 3 ? 'border-rank-silver' : 'border-border'
        )}>
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-neon-cyan bg-neon-cyan/10">
              {getInitials(profile.name)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 space-y-3">
        {/* Name + info */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-bright text-base leading-tight">
                {profile.name}
              </h3>
              <p className="text-dim text-xs mt-0.5 font-mono">
                {profile.branch.split(' ').slice(0, 3).join(' ')} · Year {profile.year}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg text-dim hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                title="Share profile"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <Link href={`/p/${profile.id}`} className="p-1.5 rounded-lg text-dim hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bio */}
        {!compact && profile.bio && (
          <p className="text-prose text-sm line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.badges.slice(0, 3).map(badge => {
              const b = BADGE_LABELS[badge]
              return (
                <span key={badge} className={cn('badge text-xs', b.color, 'bg-white/5 border border-white/10')}>
                  {b.icon} {b.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Strength tags */}
        {profile.strength_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.strength_tags.slice(0, compact ? 2 : 4).map(tag => (
              <span key={tag} className="badge-cyan text-xs">
                {STRENGTH_TAG_LABELS[tag as keyof typeof STRENGTH_TAG_LABELS] ?? tag}
              </span>
            ))}
          </div>
        )}

        {/* Social links */}
        {!compact && (
          <div className="flex items-center gap-2">
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                className="text-dim hover:text-neon-pink transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="text-dim hover:text-neon-cyan transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {profile.twitter_url && (
              <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer"
                className="text-dim hover:text-bright transition-colors">
                <Twitter className="w-3.5 h-3.5" />
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="text-dim hover:text-bright transition-colors">
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Vote buttons */}
        {showVote && !isOwnProfile && (
          <div className="pt-1 border-t border-border/50">
            <VoteButtons
              profileId={profile.id}
              currentVote={userVote ?? null}
              score={score}
              disabled={!currentUserId}
            />
          </div>
        )}

        {isOwnProfile && (
          <div className="pt-1 border-t border-border/50">
            <Link
              href="/profile"
              className="text-xs text-dim hover:text-neon-cyan transition-colors font-mono"
            >
              Edit your card →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
