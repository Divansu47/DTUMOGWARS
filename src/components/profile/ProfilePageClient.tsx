'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Crown, Instagram, Linkedin, Github, Twitter, Share2, MessageSquare, Send, Loader2 } from 'lucide-react'
import { Profile, Comment, STRENGTH_TAG_LABELS, BADGE_LABELS } from '@/lib/types'
import { cn, getInitials, getRankColor, getRankSuffix, formatScore, containsProfanity } from '@/lib/utils'
import { VoteButtons } from '@/components/voting/VoteButtons'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface ProfilePageClientProps {
  profile: Profile
  comments: any[]
  currentUserId?: string
  userVote: 1 | -1 | null
}

export function ProfilePageClient({ profile, comments: initialComments, currentUserId, userVote }: ProfilePageClientProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const rank = profile.rank ?? 0

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `${profile.name} on DTU MogWars`, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!currentUserId) {
      toast.error('Login to comment')
      return
    }
    if (containsProfanity(newComment)) {
      toast.error('Keep it clean, no abusive language')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('comments')
      .insert({
        author_id: currentUserId,
        profile_id: profile.id,
        content: newComment.trim(),
      })
      .select(`id, content, created_at, author_id, author:profiles!comments_author_id_fkey(name, avatar_url, course, year)`)
      .single()

    if (error) {
      toast.error('Failed to post comment')
    } else {
      setComments(prev => [data, ...prev])
      setNewComment('')
      toast.success('Comment posted')
    }

    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'glass rounded-2xl border overflow-hidden',
          rank === 1 ? 'border-rank-gold/40 shadow-rank-gold' : 'border-border'
        )}
      >
        {/* Cover */}
        <div className="relative h-40 bg-gradient-to-br from-neon-cyan/15 via-neon-violet/10 to-neon-pink/10">
          {profile.cover_url && (
            <Image src={profile.cover_url} alt="cover" fill className="object-cover opacity-50" />
          )}
          {rank > 0 && (
            <div className={cn(
              'absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border font-mono font-bold text-sm',
              rank === 1 ? 'border-rank-gold/40 text-rank-gold bg-rank-gold/10' : 'border-border text-dim'
            )}>
              {rank === 1 && <Crown className="w-4 h-4" />}
              {getRankSuffix(rank)} Place
            </div>
          )}
        </div>

        {/* Profile info */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 -mt-16 sm:-mt-12">
            {/* Avatar */}
            <div className={cn(
              'relative w-24 h-24 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-surface flex-shrink-0',
              rank === 1 ? 'border-rank-gold' : 'border-border'
            )}>
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-bold text-3xl text-neon-cyan bg-neon-cyan/10">
                  {getInitials(profile.name)}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 mt-4 sm:mt-10">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="font-display font-extrabold text-3xl text-bright">{profile.name}</h1>
                  <p className="text-dim font-mono text-sm mt-1">
                    {profile.branch} · Year {profile.year} · {profile.course}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleShare} className="btn-ghost text-sm px-3 py-2 gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4 mt-3">
                <span className="font-mono font-bold text-xl text-neon-cyan">
                  {formatScore(profile.vote_score ?? 0)} pts
                </span>
                <span className="text-dim text-sm font-mono">
                  {profile.total_votes ?? 0} votes
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-prose text-base leading-relaxed mt-5 border-t border-border pt-5">
              {profile.bio}
            </p>
          )}

          {/* Badges */}
          {profile.badges && profile.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.badges.map(badge => {
                const b = BADGE_LABELS[badge]
                return (
                  <span key={badge} className={cn('badge text-sm py-1 px-3', b.color, 'bg-white/5 border border-white/10')}>
                    {b.icon} {b.label}
                  </span>
                )
              })}
            </div>
          )}

          {/* Strength tags */}
          {profile.strength_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.strength_tags.map(tag => (
                <span key={tag} className="badge-cyan text-sm py-1 px-3">
                  {STRENGTH_TAG_LABELS[tag as keyof typeof STRENGTH_TAG_LABELS] ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          <div className="flex items-center gap-3 mt-4">
            {profile.instagram_url && (
              <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-dim hover:text-neon-pink transition-colors text-sm">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-dim hover:text-neon-cyan transition-colors text-sm">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-dim hover:text-bright transition-colors text-sm">
                <Github className="w-4 h-4" /> GitHub
              </a>
            )}
          </div>

          {/* Vote section */}
          {currentUserId && currentUserId !== profile.user_id && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-dim text-xs font-mono mb-3">CAST YOUR VOTE</p>
              <VoteButtons
                profileId={profile.id}
                currentVote={userVote}
                score={profile.vote_score ?? 0}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Comments */}
      <div className="glass rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-dim" />
          <h2 className="font-display font-semibold text-bright">Feedback ({comments.length})</h2>
        </div>

        {/* Comment form */}
        {currentUserId ? (
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave honest feedback..."
              maxLength={500}
              className="input-field flex-1"
            />
            <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary px-4 py-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <p className="text-dim text-sm font-mono">
            <a href="/login" className="text-neon-cyan hover:underline">Login</a> to leave feedback
          </p>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-dim text-sm text-center py-6">No feedback yet. Be the first!</p>
          ) : (
            comments.map((comment: any) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex-shrink-0 overflow-hidden">
                  {comment.author?.avatar_url ? (
                    <Image src={comment.author.avatar_url} alt="" width={32} height={32} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-dim">
                      {getInitials(comment.author?.name ?? '?')}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-semibold text-bright text-sm">
                      {comment.author?.name ?? 'Anonymous'}
                    </span>
                    <span className="text-dim text-xs font-mono">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-prose text-sm mt-0.5 leading-relaxed">{comment.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
