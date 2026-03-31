import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: 'DTU MogWars <noreply@dtumogwars.com>',
    to,
    subject: '⚔️ Welcome to DTU MogWars!',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #050508; color: #e8e8f5; padding: 32px; border-radius: 16px;">
        <h1 style="color: #00f5ff; font-size: 28px; margin-bottom: 8px;">Welcome, ${name}! ⚔️</h1>
        <p style="color: #b8b8d0; line-height: 1.6;">
          Your profile has been submitted for review. Once approved by the admin, you'll be live in the arena.
        </p>
        <p style="color: #b8b8d0; margin-top: 16px;">
          Get ready to climb the leaderboard. May the best mog win.
        </p>
        <a href="https://dtumogwars.vercel.app/explore"
          style="display: inline-block; margin-top: 24px; background: #00f5ff; color: #050508; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
          Explore the Arena →
        </a>
        <p style="color: #3a3a55; font-size: 12px; margin-top: 32px;">DTU MogWars · Delhi Technological University</p>
      </div>
    `,
  })
}

export async function sendProfileApprovedEmail(to: string, name: string, profileId: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: 'DTU MogWars <noreply@dtumogwars.com>',
    to,
    subject: '✅ Your MogWars Profile is LIVE!',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #050508; color: #e8e8f5; padding: 32px; border-radius: 16px;">
        <h1 style="color: #06d6a0; font-size: 28px; margin-bottom: 8px;">You're LIVE, ${name}! 🚀</h1>
        <p style="color: #b8b8d0; line-height: 1.6;">
          Your profile has been approved and is now visible to the entire DTU community. 
          Start collecting votes and climb the leaderboard!
        </p>
        <a href="https://dtumogwars.vercel.app/p/${profileId}"
          style="display: inline-block; margin-top: 24px; background: #00f5ff; color: #050508; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
          View Your Card →
        </a>
      </div>
    `,
  })
}

export async function sendNewVoteEmail(to: string, name: string, voterName: string) {
  if (!process.env.RESEND_API_KEY) return

  await resend.emails.send({
    from: 'DTU MogWars <noreply@dtumogwars.com>',
    to,
    subject: `🗳️ ${voterName} just voted on your profile`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #050508; color: #e8e8f5; padding: 32px; border-radius: 16px;">
        <h2 style="color: #00f5ff;">New Vote! 🗳️</h2>
        <p style="color: #b8b8d0;">${voterName} just voted on your MogWars profile. Check your current ranking!</p>
        <a href="https://dtumogwars.vercel.app/leaderboard"
          style="display: inline-block; margin-top: 24px; background: #00f5ff; color: #050508; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
          View Leaderboard →
        </a>
      </div>
    `,
  })
}
