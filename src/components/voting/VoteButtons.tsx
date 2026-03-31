'use client'

import { useState, useTransition } from 'react'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface VoteButtonsProps {
  profileId: string
  currentVote: 1 | -1 | null
  score: number
  disabled?: boolean
}

export function VoteButtons({ profileId, currentVote, score, disabled }: VoteButtonsProps) {
  const [vote, setVote] = useState<1 | -1 | null>(currentVote)
  const [optimisticScore, setOptimisticScore] = useState(score)
  const [isPending, startTransition] = useTransition()

  const handleVote = (value: 1 | -1) => {
    if (disabled) {
      toast.error('Login to vote')
      return
    }

    const supabase = createClient()
    const prevVote = vote
    const prevScore = optimisticScore

    // Optimistic update
    if (vote === value) {
      // Remove vote
      setVote(null)
      setOptimisticScore(prev => prev - value)
    } else {
      // Change or add vote
      const diff = vote ? value - vote : value
      setVote(value)
      setOptimisticScore(prev => prev + diff)
    }

    startTransition(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('You must be logged in to vote')
          setVote(prevVote)
          setOptimisticScore(prevScore)
          return
        }

        if (prevVote === value) {
          // Delete vote
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('voter_id', user.id)
            .eq('profile_id', profileId)
          if (error) throw error
        } else if (prevVote === null) {
          // Insert new vote
          const { error } = await supabase
            .from('votes')
            .insert({ voter_id: user.id, profile_id: profileId, value })
          if (error) throw error
        } else {
          // Update existing vote
          const { error } = await supabase
            .from('votes')
            .update({ value })
            .eq('voter_id', user.id)
            .eq('profile_id', profileId)
          if (error) throw error
        }
      } catch (err) {
        // Rollback
        setVote(prevVote)
        setOptimisticScore(prevScore)
        toast.error('Failed to record vote')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          vote === 1
            ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
            : 'text-dim hover:text-neon-cyan hover:bg-neon-cyan/5 border border-transparent hover:border-neon-cyan/20'
        )}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ThumbsUp className={cn('w-3.5 h-3.5', vote === 1 && 'fill-neon-cyan')} />
        )}
        Up
      </button>

      <span className={cn(
        'font-mono font-bold text-sm min-w-[2.5rem] text-center',
        optimisticScore > 0 ? 'text-neon-cyan' : optimisticScore < 0 ? 'text-neon-pink' : 'text-dim'
      )}>
        {optimisticScore > 0 ? '+' : ''}{optimisticScore}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          vote === -1
            ? 'bg-neon-pink/15 text-neon-pink border border-neon-pink/30'
            : 'text-dim hover:text-neon-pink hover:bg-neon-pink/5 border border-transparent hover:border-neon-pink/20'
        )}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ThumbsDown className={cn('w-3.5 h-3.5', vote === -1 && 'fill-neon-pink')} />
        )}
        Down
      </button>
    </div>
  )
}
