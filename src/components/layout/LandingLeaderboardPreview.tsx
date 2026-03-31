'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getRankSuffix, getInitials, getRankColor } from '@/lib/utils'
import { Crown, ArrowRight } from 'lucide-react'

interface MiniProfile {
  id: string
  name: string
  avatar_url: string | null
  branch: string
  year: number
  vote_score: number
  rank: number
  strength_tags: string[]
}

export function LandingLeaderboardPreview({ profiles }: { profiles: MiniProfile[] }) {
  if (!profiles.length) return null

  return (
    <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="font-mono text-dim text-xs tracking-widest mb-3">CURRENT STANDINGS</p>
        <h2 className="font-display font-bold text-3xl text-bright">Top MogWars</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href="/login">
              <div
                className={`glass card-shine rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer ${
                  profile.rank === 1 ? 'border-rank-gold/30 shadow-rank-gold' : 'border-border'
                }`}
              >
                {/* Rank badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-mono font-bold text-lg ${getRankColor(profile.rank)}`}>
                    {profile.rank === 1 && <Crown className="inline w-4 h-4 mr-1" />}
                    {getRankSuffix(profile.rank)}
                  </span>
                  <span className="font-mono text-xs text-dim">
                    +{profile.vote_score} pts
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                    {profile.avatar_url ? (
                      <Image src={profile.avatar_url} alt={profile.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-bold text-neon-cyan">
                        {getInitials(profile.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-bright text-sm">{profile.name}</p>
                    <p className="text-dim text-xs">{profile.branch.split(' ').slice(0, 2).join(' ')} • Y{profile.year}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {profile.strength_tags.slice(0, 2).map(tag => (
                    <span key={tag} className="badge-cyan text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link href="/login" className="btn-ghost inline-flex items-center gap-2 text-sm">
          See Full Leaderboard <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  )
}
