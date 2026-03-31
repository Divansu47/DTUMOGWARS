'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Shuffle, SlidersHorizontal } from 'lucide-react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { Profile, DTU_BRANCHES, STRENGTH_TAG_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ExploreClientProps {
  initialProfiles: Profile[]
  userVotes: Record<string, 1 | -1>
  currentUserId?: string
  filters: {
    branch?: string
    year?: string
    tag?: string
    q?: string
    sort?: string
  }
}

const SORT_OPTIONS = [
  { value: 'rank', label: 'Top Ranked' },
  { value: 'score', label: 'Most Points' },
  { value: 'newest', label: 'Newest' },
]

export function ExploreClient({ initialProfiles, userVotes, currentUserId, filters }: ExploreClientProps) {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState(filters.q ?? '')

  const updateFilter = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams()
    if (filters.branch) params.set('branch', filters.branch)
    if (filters.year) params.set('year', filters.year)
    if (filters.tag) params.set('tag', filters.tag)
    if (filters.q) params.set('q', filters.q)
    if (filters.sort) params.set('sort', filters.sort)

    if (value) params.set(key, value)
    else params.delete(key)

    router.push(`/explore?${params.toString()}`)
  }, [filters, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('q', search || undefined)
  }

  const goRandom = () => {
    if (!initialProfiles.length) return
    const random = initialProfiles[Math.floor(Math.random() * initialProfiles.length)]
    router.push(`/p/${random.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-bright">Explore</h1>
          <p className="text-dim text-sm mt-0.5">{initialProfiles.length} profiles in the arena</p>
        </div>
        <button onClick={goRandom} className="btn-ghost text-sm gap-2">
          <Shuffle className="w-4 h-4" /> Random
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="input-field pl-9 pr-4"
          />
        </form>

        <div className="flex gap-2">
          <select
            value={filters.sort ?? 'rank'}
            onChange={e => updateFilter('sort', e.target.value)}
            className="input-field py-2 px-3 text-sm w-auto"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn('btn-ghost text-sm gap-2 px-3', showFilters && 'border-neon-cyan text-neon-cyan bg-neon-cyan/5')}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4 border border-border space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Branch filter */}
            <div>
              <label className="block text-xs text-dim mb-2 font-mono uppercase tracking-wider">Branch</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateFilter('branch', undefined)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-lg border transition-all',
                    !filters.branch ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan' : 'border-border text-dim hover:border-muted'
                  )}
                >All</button>
                {['Computer Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering'].map(b => (
                  <button
                    key={b}
                    onClick={() => updateFilter('branch', b)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-lg border transition-all',
                      filters.branch === b ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan' : 'border-border text-dim hover:border-muted'
                    )}
                  >
                    {b.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Year filter */}
            <div>
              <label className="block text-xs text-dim mb-2 font-mono uppercase tracking-wider">Year</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => updateFilter('year', undefined)}
                  className={cn(
                    'text-xs px-3 py-1 rounded-lg border transition-all',
                    !filters.year ? 'border-neon-violet/40 bg-neon-violet/10 text-neon-violet' : 'border-border text-dim hover:border-muted'
                  )}
                >All</button>
                {[1, 2, 3, 4].map(y => (
                  <button
                    key={y}
                    onClick={() => updateFilter('year', y.toString())}
                    className={cn(
                      'text-xs px-3 py-1 rounded-lg border transition-all',
                      filters.year === y.toString() ? 'border-neon-violet/40 bg-neon-violet/10 text-neon-violet' : 'border-border text-dim hover:border-muted'
                    )}
                  >Y{y}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {(filters.branch || filters.year || filters.tag) && (
            <button
              onClick={() => router.push('/explore')}
              className="text-xs text-dim hover:text-neon-pink transition-colors font-mono"
            >
              ✕ Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Profile grid */}
      {initialProfiles.length === 0 ? (
        <div className="text-center py-20 text-dim">
          <Filter className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-display font-semibold text-prose">No profiles found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {initialProfiles.map((profile, i) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              currentUserId={currentUserId}
              userVote={userVotes[profile.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
