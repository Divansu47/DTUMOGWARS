import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-neon-violet/8 rounded-full blur-3xl pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-1.5">
          <Zap className="w-5 h-5 text-neon-cyan" />
          <span className="font-display font-extrabold text-lg text-bright">DTU</span>
          <span className="font-display font-extrabold text-lg gradient-text-cyan">MogWars</span>
        </Link>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}
