# ⚔️ DTU MogWars

**The Ultimate Personality Arena at Delhi Technological University**

A full-stack social ranking platform where students submit personality-focused profile cards, vote on each other, and compete for the top spot on the leaderboard.

---

## 🗂 Project Structure

```
dtumogwars/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx              ← Auth pages layout
│   │   │   ├── login/page.tsx          ← Login page
│   │   │   └── register/page.tsx       ← Register page
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ← Dashboard layout (with Navbar)
│   │   │   ├── explore/page.tsx        ← Browse all profiles
│   │   │   ├── leaderboard/page.tsx    ← Animated leaderboard
│   │   │   └── profile/page.tsx        ← Create/edit own profile
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   └── profile/[id]/page.tsx  ← Public profile with comments
│   │   ├── admin/
│   │   │   ├── layout.tsx              ← Admin layout (role-gated)
│   │   │   ├── page.tsx                ← Admin dashboard
│   │   │   ├── profiles/page.tsx       ← Approve/reject profiles
│   │   │   ├── comments/page.tsx       ← Moderate comments
│   │   │   └── rankings/page.tsx       ← Override rankings
│   │   ├── auth/callback/route.ts      ← Supabase email callback
│   │   ├── p/[id]/page.tsx             ← Short URL redirect
│   │   ├── layout.tsx                  ← Root layout
│   │   └── page.tsx                    ← Landing page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── LandingHero.tsx
│   │   │   ├── LandingLeaderboardPreview.tsx
│   │   │   ├── LandingFeatures.tsx
│   │   │   └── PostHogProvider.tsx
│   │   ├── profile/
│   │   │   ├── ProfileCard.tsx         ← The main player card component
│   │   │   ├── ProfileForm.tsx         ← Create/edit profile form
│   │   │   ├── ProfilePageClient.tsx   ← Full profile view + comments
│   │   │   └── ExploreClient.tsx       ← Grid with search + filters
│   │   ├── voting/
│   │   │   └── VoteButtons.tsx         ← Optimistic upvote/downvote
│   │   ├── leaderboard/
│   │   │   └── LeaderboardClient.tsx   ← Podium + ranked list
│   │   └── admin/
│   │       ├── AdminProfilesClient.tsx
│   │       ├── AdminCommentsClient.tsx
│   │       └── AdminRankingsClient.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               ← Browser Supabase client
│   │   │   ├── server.ts               ← Server + admin clients
│   │   │   └── middleware.ts           ← Auth session refresh
│   │   ├── types/index.ts              ← All TypeScript types + constants
│   │   └── utils/
│   │       ├── index.ts                ← Helper functions
│   │       └── email.ts                ← Resend email helpers
│   ├── styles/globals.css              ← Global styles + design tokens
│   └── middleware.ts                   ← Route protection
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      ← Full DB schema
├── .env.example                        ← Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## 🚀 Setup Guide

### Step 1 — Clone & Install

```bash
git clone https://github.com/yourusername/dtumogwars.git
cd dtumogwars
npm install
```

### Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In **SQL Editor**, paste and run the entire contents of `supabase/migrations/001_initial_schema.sql`
3. In **Storage**, create a new public bucket named `profiles`
   - Go to Storage → New Bucket → Name: `profiles` → Toggle Public ON
4. In **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) or your Vercel URL (prod)
   - Redirect URLs: add `http://localhost:3000/auth/callback`
5. Get your keys from **Settings → API**

### Step 3 — Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional (for email notifications):
```env
RESEND_API_KEY=re_xxxx
```

Optional (for analytics):
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
```

### Step 4 — Create Your Admin Account

1. Register at `http://localhost:3000/register` with your email
2. In **Supabase SQL Editor**, run:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 5 — Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🗄️ Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Extends Supabase auth, stores role (student/admin) |
| `profiles` | User profile cards with all personal info |
| `votes` | Upvote/downvote records (1 per user per profile) |
| `comments` | Feedback comments on profiles |
| `rankings` | Materialized ranking scores and positions |
| `notifications` | User notification inbox |

### Key Relationships

```
auth.users (Supabase)
    ↓ 1:1
public.users
    ↓ 1:1
public.profiles
    ↓ 1:many
public.votes       ← voter_id (users) + profile_id (profiles) — UNIQUE together
public.comments    ← author_id (users) + profile_id (profiles)
public.rankings    ← profile_id (profiles) — auto-updated via trigger
```

### Ranking Computation

Rankings are auto-recomputed via a PostgreSQL trigger after every vote INSERT/UPDATE/DELETE:

```sql
score = COALESCE(admin_score_override, SUM(vote values))
rank  = ROW_NUMBER() OVER (ORDER BY score DESC)
```

Admins can override any profile's score from the Rankings admin panel, which takes precedence over vote tallies.

---

## 🔑 Key Features

### Authentication
- Email/password via Supabase Auth
- Session handled server-side with `@supabase/ssr`
- Protected routes via Next.js middleware
- Admin role gating

### Profile System
- Avatar upload to Supabase Storage
- Up to 5 strength tags
- Social links (Instagram, LinkedIn, Twitter, GitHub)
- Admin approve/reject before going live
- Status: `pending → approved | rejected`

### Voting
- Upvote (+1) or downvote (-1) per profile
- One vote per user per profile (database-enforced unique constraint)
- Self-voting blocked (RLS policy)
- Optimistic UI updates with automatic rollback on error
- Vote changes trigger real-time ranking recomputation

### Leaderboard
- Podium display for top 3 (gold/silver/bronze)
- Animated ranked list for positions 4+
- Filter by year
- Admin score override support

### Admin Panel
- **Profiles**: Approve, reject, re-approve, hide/show, delete
- **Comments**: Hide or delete any comment
- **Rankings**: Override scores, recompute all rankings
- **Dashboard**: Stats overview + pending queue

---

## 🚢 Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial DTU MogWars setup"
git remote add origin https://github.com/yourusername/dtumogwars.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)

### Step 3 — Set Environment Variables in Vercel

In the Vercel dashboard → Project Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | `https://dtumogwars.vercel.app` |
| `RESEND_API_KEY` | Your Resend key (optional) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Your PostHog key (optional) |

### Step 4 — Update Supabase Auth URLs

In Supabase → Authentication → URL Configuration:
- **Site URL**: `https://dtumogwars.vercel.app`
- **Redirect URLs**: add `https://dtumogwars.vercel.app/auth/callback`

### Step 5 — Deploy

Click **Deploy** in Vercel. That's it! 🎉

---

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `void` | `#050508` | Page background |
| `neon-cyan` | `#00f5ff` | Primary accent, links |
| `neon-violet` | `#7c3aed` | Secondary accent |
| `neon-pink` | `#ff006e` | Danger, downvotes |
| `neon-amber` | `#ffbe0b` | Warnings, pending |
| `rank-gold` | `#ffd700` | #1 rank |

### Typography
- **Display**: Syne (headings, numbers, bold statements)
- **Body**: DM Sans (prose, labels)
- **Mono**: JetBrains Mono (tags, ranks, metadata)

---

## 🔒 Security

- **RLS enabled** on all tables — no data leaks
- **Self-vote prevention** enforced at database level
- **Admin role check** in both middleware and Supabase RLS
- **Service role key** only used server-side, never exposed to client
- **Comment profanity filter** (basic, extensible)
- All environment secrets via `.env.local` / Vercel env vars

---

## 🧩 Extending the Project

### Add DTU Email-Only Registration

In `register/page.tsx`, uncomment:
```typescript
if (!email.endsWith('@dtu.ac.in')) {
  toast.error('Only DTU email addresses are allowed')
  return
}
```

### Add Real-Time Vote Updates

In Explore/Leaderboard, subscribe to Supabase realtime:
```typescript
const channel = supabase
  .channel('votes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
    router.refresh()
  })
  .subscribe()
```

### Add Badges System

Badges are computed client-side via `computeBadges()` in `src/lib/utils/index.ts`. To persist them, add a `badges TEXT[]` column to profiles and update via trigger.

### Notifications

The `notifications` table is fully set up. Wire it to actions by inserting rows:
```sql
INSERT INTO notifications (user_id, type, message, link)
VALUES (profile_owner_id, 'vote', 'Someone voted on your profile!', '/p/' || profile_id);
```

---

## 📄 License

MIT — build on it, fork it, make it legendary at DTU.

---

*Built for the students of Delhi Technological University. May the best mog win. ⚔️*
