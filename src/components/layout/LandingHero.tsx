'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Trophy, Users } from 'lucide-react'

export function LandingHero() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
      {/* Live badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 badge-cyan mb-8 text-xs font-mono"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-slow" />
        SEASON 1 IS LIVE — JOIN THE WAR
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6"
      >
        <span className="text-bright">Who's The</span>
        <br />
        <span className="gradient-text-cyan text-glow-cyan">Top Mog</span>
        <br />
        <span className="text-bright">At DTU?</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-prose text-lg md:text-xl max-w-xl mb-10 leading-relaxed"
      >
        Submit your player card. Get voted. Rise through the ranks.
        The ultimate personality arena at Delhi Technological University.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <Link href="/register" className="btn-primary gap-2 text-base px-8 py-4">
          Create Your Card
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/login" className="btn-ghost text-base px-8 py-4">
          View Leaderboard
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-8 mt-16 text-center"
      >
        {[
          { icon: Users, label: 'Students', value: '500+' },
          { icon: Trophy, label: 'Rankings', value: 'Live' },
          { icon: Zap, label: 'Votes Cast', value: '10k+' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <Icon className="w-4 h-4 text-dim mb-1" />
            <span className="font-display font-bold text-2xl text-bright">{value}</span>
            <span className="text-dim text-xs font-mono">{label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
