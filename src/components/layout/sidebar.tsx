'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ProjectSwitcher } from './project-switcher'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  GitBranch,
  Settings,
  LayoutGrid,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const params = useParams()
  const currentProjectId = params?.projectId as string | undefined

  const projectNavLinks = currentProjectId
    ? [
        {
          href: `/p/${currentProjectId}`,
          label: 'Dashboard',
          icon: LayoutDashboard,
          exact: true,
        },
        {
          href: `/p/${currentProjectId}/intake`,
          label: 'Intake',
          icon: MessageSquare,
          exact: false,
        },
        {
          href: `/p/${currentProjectId}/issues`,
          label: 'Issues',
          icon: GitBranch,
          exact: false,
        },
        {
          href: `/p/${currentProjectId}/settings`,
          label: 'Settings',
          icon: Settings,
          exact: false,
        },
      ]
    : []

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Branding */}
      <div className="flex h-14 items-center px-4 border-b">
        <span className="font-semibold text-sm">⬡ Software Factory</span>
      </div>

      {/* Project Switcher */}
      <div className="p-3">
        <ProjectSwitcher />
      </div>

      {/* Per-project nav */}
      {projectNavLinks.length > 0 && (
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            {projectNavLinks.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive(link.href, link.exact)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {!projectNavLinks.length && <div className="flex-1" />}

      <Separator />

      {/* All Projects */}
      <div className="p-2">
        <Link
          href="/projects/overview"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/projects/overview'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          All Projects
        </Link>
      </div>
    </aside>
  )
}
