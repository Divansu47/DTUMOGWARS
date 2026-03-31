import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BadgeType, Profile } from '@/lib/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
  return score.toString()
}

export function getRankSuffix(rank: number): string {
  const j = rank % 10
  const k = rank % 100
  if (j === 1 && k !== 11) return `${rank}st`
  if (j === 2 && k !== 12) return `${rank}nd`
  if (j === 3 && k !== 13) return `${rank}rd`
  return `${rank}th`
}

export function computeBadges(profile: Profile, totalProfiles: number): BadgeType[] {
  const badges: BadgeType[] = []
  const rank = profile.rank ?? Infinity

  if (rank === 1) badges.push('number1')
  else if (rank <= 3) badges.push('top3')
  else if (rank <= 10) badges.push('top10')

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceCreated <= 7) badges.push('newcomer')
  if (daysSinceCreated > 365) badges.push('veteran')
  if ((profile.total_votes ?? 0) > 50) badges.push('most_voted')

  return badges
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-rank-gold'
  if (rank <= 3) return 'text-rank-silver'
  if (rank <= 10) return 'text-rank-bronze'
  return 'text-prose'
}

export function getRankGlow(rank: number): string {
  if (rank === 1) return 'shadow-rank-gold border-rank-gold/40'
  if (rank <= 3) return 'border-rank-silver/30'
  if (rank <= 10) return 'border-rank-bronze/20'
  return 'border-border'
}

// Basic profanity filter
const BANNED_WORDS = ['spam', 'abuse']
export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BANNED_WORDS.some(w => lower.includes(w))
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function shareProfile(profileId: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://dtumogwars.vercel.app'}/p/${profileId}`
}
