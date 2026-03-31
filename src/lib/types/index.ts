export type UserRole = 'student' | 'admin'

export type ProfileStatus = 'pending' | 'approved' | 'rejected'

export type StrengthTag =
  | 'confidence'
  | 'fashion'
  | 'fitness'
  | 'charisma'
  | 'intelligence'
  | 'humor'
  | 'creativity'
  | 'leadership'
  | 'vibes'
  | 'hustle'
  | 'chill'
  | 'artsy'

export type BadgeType =
  | 'top10'
  | 'top3'
  | 'number1'
  | 'rising_star'
  | 'most_voted'
  | 'newcomer'
  | 'veteran'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  name: string
  course: string
  branch: string
  year: number
  bio: string
  avatar_url: string | null
  cover_url: string | null
  strength_tags: StrengthTag[]
  instagram_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  status: ProfileStatus
  is_visible: boolean
  admin_score_override: number | null
  created_at: string
  updated_at: string
  // Computed
  vote_score?: number
  rank?: number
  badges?: BadgeType[]
  total_votes?: number
}

export interface Vote {
  id: string
  voter_id: string
  profile_id: string
  value: 1 | -1
  created_at: string
}

export interface Comment {
  id: string
  author_id: string
  profile_id: string
  content: string
  is_hidden: boolean
  created_at: string
  // Joined
  author?: Pick<Profile, 'name' | 'avatar_url' | 'course' | 'year'>
}

export interface Ranking {
  id: string
  profile_id: string
  score: number
  rank: number
  computed_at: string
  // Joined
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'vote' | 'comment' | 'rank_change' | 'badge_earned' | 'approved'
  message: string
  is_read: boolean
  link: string | null
  created_at: string
}

// DTU branches
export const DTU_BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Environmental Engineering',
  'Biotechnology',
  'Chemical Engineering',
  'Production & Industrial Engineering',
  'Software Engineering',
  'Mathematics & Computing',
] as const

export type DTUBranch = (typeof DTU_BRANCHES)[number]

export const YEARS = [1, 2, 3, 4] as const

export const STRENGTH_TAG_LABELS: Record<StrengthTag, string> = {
  confidence: '🔥 Confidence',
  fashion: '👔 Fashion',
  fitness: '💪 Fitness',
  charisma: '✨ Charisma',
  intelligence: '🧠 Intelligence',
  humor: '😂 Humor',
  creativity: '🎨 Creativity',
  leadership: '👑 Leadership',
  vibes: '🌊 Vibes',
  hustle: '⚡ Hustle',
  chill: '❄️ Chill',
  artsy: '🎭 Artsy',
}

export const BADGE_LABELS: Record<BadgeType, { label: string; icon: string; color: string }> = {
  number1: { label: '#1 MogWar', icon: '👑', color: 'text-rank-gold' },
  top3: { label: 'Top 3', icon: '🥉', color: 'text-rank-bronze' },
  top10: { label: 'Top 10', icon: '⭐', color: 'text-neon-cyan' },
  rising_star: { label: 'Rising Star', icon: '🚀', color: 'text-neon-violet' },
  most_voted: { label: 'Most Voted', icon: '🗳️', color: 'text-neon-amber' },
  newcomer: { label: 'Newcomer', icon: '🌟', color: 'text-neon-green' },
  veteran: { label: 'Veteran', icon: '🎖️', color: 'text-prose' },
}
