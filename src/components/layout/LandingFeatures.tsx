'use client'

import { motion } from 'framer-motion'
import { Trophy, Vote, MessageSquare, Star, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Star,
    title: 'Player Cards',
    desc: 'Craft your identity — branch, vibe, strength tags, social links. Your card is your weapon.',
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/20',
  },
  {
    icon: Vote,
    title: 'Vote System',
    desc: 'Upvote the legends, downvote the frauds. One vote per profile, no spam.',
    color: 'text-neon-violet',
    bg: 'bg-neon-violet/10',
    border: 'border-neon-violet/20',
  },
  {
    icon: Trophy,
    title: 'Live Leaderboard',
    desc: 'Rankings update in real-time. Filter by branch, year, or category.',
    color: 'text-rank-gold',
    bg: 'bg-rank-gold/10',
    border: 'border-rank-gold/20',
  },
  {
    icon: MessageSquare,
    title: 'Feedback Culture',
    desc: 'Leave honest comments. Build each other up. This is a growth arena.',
    color: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/20',
  },
  {
    icon: Zap,
    title: 'Gamified Badges',
    desc: 'Earn Top 10, Rising Star, Most Voted and more as you climb the ranks.',
    color: 'text-neon-amber',
    bg: 'bg-neon-amber/10',
    border: 'border-neon-amber/20',
  },
  {
    icon: Shield,
    title: 'Admin Moderated',
    desc: 'All profiles are verified. No bots, no fakes. Just real DTU energy.',
    color: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/20',
  },
]

export function LandingFeatures() {
  return (
    <section className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="font-mono text-dim text-xs tracking-widest mb-3">HOW IT WORKS</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-bright">
          The Arena Rules
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`glass rounded-2xl p-6 border ${f.border} hover:scale-[1.01] transition-all duration-300`}
          >
            <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center mb-4`}>
              <f.icon className={`w-5 h-5 ${f.color}`} />
            </div>
            <h3 className="font-display font-semibold text-bright text-base mb-2">{f.title}</h3>
            <p className="text-dim text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
