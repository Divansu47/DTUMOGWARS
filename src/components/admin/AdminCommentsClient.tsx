'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import Image from 'next/image'

export function AdminCommentsClient({ comments }: { comments: any[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all')

  const filtered = comments.filter(c => {
    if (filter === 'visible') return !c.is_hidden
    if (filter === 'hidden') return c.is_hidden
    return true
  })

  const toggleHide = async (commentId: string, currentlyHidden: boolean) => {
    setActionLoading(commentId)
    const supabase = createClient()

    const { error } = await supabase
      .from('comments')
      .update({ is_hidden: !currentlyHidden })
      .eq('id', commentId)

    if (error) toast.error('Failed to update')
    else {
      toast.success(currentlyHidden ? 'Comment shown' : 'Comment hidden')
      startTransition(() => router.refresh())
    }
    setActionLoading(null)
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment permanently?')) return
    setActionLoading(commentId + 'del')
    const supabase = createClient()

    const { error } = await supabase.from('comments').delete().eq('id', commentId)

    if (error) toast.error('Delete failed')
    else {
      toast.success('Comment deleted')
      startTransition(() => router.refresh())
    }
    setActionLoading(null)
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'visible', 'hidden'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize',
              filter === f
                ? 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30'
                : 'text-dim border-border hover:border-muted hover:text-prose'
            )}
          >
            {f} ({f === 'all' ? comments.length : f === 'visible' ? comments.filter(c => !c.is_hidden).length : comments.filter(c => c.is_hidden).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-dim">No comments</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                'glass rounded-xl border p-4',
                comment.is_hidden ? 'border-border opacity-60' : 'border-border'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Author avatar */}
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex-shrink-0 overflow-hidden">
                  {comment.author?.avatar_url ? (
                    <Image src={comment.author.avatar_url} alt="" width={32} height={32} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-dim">
                      {getInitials(comment.author?.name ?? '?')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-display font-semibold text-bright text-sm">
                      {comment.author?.name ?? 'Unknown'}
                    </span>
                    <span className="text-dim text-xs font-mono">→</span>
                    <span className="text-dim text-xs font-mono">
                      on {comment.profile?.name ?? 'Unknown Profile'}
                    </span>
                    <span className="text-muted text-xs font-mono">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.is_hidden && (
                      <span className="badge text-xs bg-white/5 text-dim border border-border">hidden</span>
                    )}
                  </div>
                  <p className="text-prose text-sm mt-1">{comment.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleHide(comment.id, comment.is_hidden)}
                    disabled={!!actionLoading}
                    className="p-1.5 rounded-lg text-dim hover:text-bright hover:bg-elevated transition-all"
                    title={comment.is_hidden ? 'Show comment' : 'Hide comment'}
                  >
                    {actionLoading === comment.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : comment.is_hidden ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    disabled={!!actionLoading}
                    className="p-1.5 rounded-lg text-dim hover:text-neon-pink hover:bg-neon-pink/5 transition-all"
                    title="Delete comment"
                  >
                    {actionLoading === comment.id + 'del' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
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
