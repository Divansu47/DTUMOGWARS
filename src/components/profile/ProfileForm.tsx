'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, DTU_BRANCHES, STRENGTH_TAG_LABELS, StrengthTag } from '@/lib/types'
import { motion } from 'framer-motion'
import { Upload, Loader2, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProfileFormProps {
  existingProfile: Profile | null
  userId: string
}

export function ProfileForm({ existingProfile, userId }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(existingProfile?.avatar_url ?? null)

  const [form, setForm] = useState({
    name: existingProfile?.name ?? '',
    course: existingProfile?.course ?? '',
    branch: existingProfile?.branch ?? '',
    year: existingProfile?.year?.toString() ?? '1',
    bio: existingProfile?.bio ?? '',
    strength_tags: (existingProfile?.strength_tags ?? []) as StrengthTag[],
    instagram_url: existingProfile?.instagram_url ?? '',
    linkedin_url: existingProfile?.linkedin_url ?? '',
    twitter_url: existingProfile?.twitter_url ?? '',
    github_url: existingProfile?.github_url ?? '',
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleTag = (tag: StrengthTag) => {
    setForm(prev => ({
      ...prev,
      strength_tags: prev.strength_tags.includes(tag)
        ? prev.strength_tags.filter(t => t !== tag)
        : prev.strength_tags.length < 5
          ? [...prev.strength_tags, tag]
          : prev.strength_tags,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.branch || !form.bio) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.bio.length > 500) {
      toast.error('Bio must be under 500 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Verify user is authenticated before proceeding
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      toast.error('Please log in before creating your profile')
      setLoading(false)
      return
    }
    if (currentUser.id !== userId) {
      toast.error('User session mismatch. Please refresh and try again.')
      setLoading(false)
      return
    }

    try {
      let avatar_url = existingProfile?.avatar_url ?? null

      // Upload avatar to Supabase storage
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${userId}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(path, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(path)

        avatar_url = publicUrl
      }

      const profileData = {
        user_id: userId,
        name: form.name,
        course: form.course,
        branch: form.branch,
        year: parseInt(form.year),
        bio: form.bio,
        avatar_url,
        strength_tags: form.strength_tags,
        instagram_url: form.instagram_url || null,
        linkedin_url: form.linkedin_url || null,
        twitter_url: form.twitter_url || null,
        github_url: form.github_url || null,
        // Reset to pending on re-submit if previously rejected
        status: existingProfile?.status === 'rejected' ? 'pending' : existingProfile?.status ?? 'pending',
      }

      if (existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', existingProfile.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData)
        if (error) throw error

        // Mark user as having a profile
        await supabase.from('users').update({ has_profile: true }).eq('id', userId)
      }

      toast.success(existingProfile ? 'Profile updated!' : 'Profile submitted for review!')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar upload */}
      <div className="glass rounded-2xl border border-border p-6">
        <h2 className="font-display font-semibold text-bright text-sm mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface border border-border flex-shrink-0">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dim">
                <Upload className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <label className="btn-ghost text-sm cursor-pointer">
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              Upload Photo
            </label>
            <p className="text-dim text-xs mt-1.5">JPG, PNG, WebP · Max 5MB</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="glass rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-bright text-sm">Basic Info</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dim mb-1.5 font-mono">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs text-dim mb-1.5 font-mono">Course</label>
            <input
              type="text"
              value={form.course}
              onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
              placeholder="B.Tech, M.Tech, MBA..."
              className="input-field"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dim mb-1.5 font-mono">Branch *</label>
            <select
              value={form.branch}
              onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
              required
              className="input-field"
            >
              <option value="">Select branch</option>
              {DTU_BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-dim mb-1.5 font-mono">Year *</label>
            <select
              value={form.year}
              onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
              className="input-field"
            >
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-dim mb-1.5 font-mono">
            Bio * <span className="text-muted">({form.bio.length}/500)</span>
          </label>
          <textarea
            value={form.bio}
            onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
            placeholder="Who are you? What makes you the top mog at DTU? Flex a little..."
            rows={4}
            maxLength={500}
            required
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Strength tags */}
      <div className="glass rounded-2xl border border-border p-6">
        <h2 className="font-display font-semibold text-bright text-sm mb-1">Strength Tags</h2>
        <p className="text-dim text-xs mb-4 font-mono">Pick up to 5 that define you</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STRENGTH_TAG_LABELS) as StrengthTag[]).map(tag => {
            const isSelected = form.strength_tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'text-sm px-3 py-1.5 rounded-xl border transition-all duration-200',
                  isSelected
                    ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan'
                    : 'border-border text-dim hover:border-muted hover:text-prose'
                )}
              >
                {STRENGTH_TAG_LABELS[tag]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Social links */}
      <div className="glass rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-display font-semibold text-bright text-sm">Social Links <span className="text-dim font-normal">(optional)</span></h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'instagram_url', placeholder: 'https://instagram.com/username', label: 'Instagram' },
            { key: 'linkedin_url', placeholder: 'https://linkedin.com/in/username', label: 'LinkedIn' },
            { key: 'twitter_url', placeholder: 'https://twitter.com/username', label: 'Twitter / X' },
            { key: 'github_url', placeholder: 'https://github.com/username', label: 'GitHub' },
          ].map(({ key, placeholder, label }) => (
            <div key={key}>
              <label className="block text-xs text-dim mb-1.5 font-mono">{label}</label>
              <input
                type="url"
                value={form[key as keyof typeof form] as string}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="input-field text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center text-base py-4"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : existingProfile ? (
          <><Save className="w-4 h-4" /> Update Card</>
        ) : (
          <><CheckCircle className="w-4 h-4" /> Submit for Review</>
        )}
      </button>
    </form>
  )
}
