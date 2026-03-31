import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-bright">
          {profile ? 'Your Player Card' : 'Create Your Card'}
        </h1>
        <p className="text-dim text-sm mt-1">
          {profile
            ? profile.status === 'pending'
              ? '⏳ Your profile is under review by admin'
              : profile.status === 'approved'
                ? '✅ Your profile is live'
                : '❌ Your profile was rejected — update and resubmit'
            : 'Fill in your details to enter the arena'}
        </p>
      </div>

      <ProfileForm existingProfile={profile} userId={user.id} />
    </div>
  )
}
