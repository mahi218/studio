'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Logo from './Logo'

interface HeaderProps {
  session: {
    id: string
    name: string
    email: string
    role: 'employee' | 'admin'
  } | null
}

export default function Header({ session }: HeaderProps) {
  const pathname = usePathname()

  const employeeNav = [
    { name: 'Report Issue', href: '/report' },
    { name: 'My Reports', href: '/my-reports' },
  ]

  const adminNav = [{ name: 'Dashboard', href: '/dashboard' }]

  const navItems = session?.role === 'admin' ? adminNav : employeeNav

  return (
    <header className="w-full bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href={session ? (session.role === 'admin' ? '/dashboard' : '/report') : '/'} className="flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          {session && (
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  asChild
                  className={cn(
                    pathname === item.href && 'bg-accent text-accent-foreground'
                  )}
                >
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}
            </nav>
          )}

          {session ? (
            <form action={logout}>
              <Button variant="outline">Logout</Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  )
}
