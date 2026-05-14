export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params
  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get()

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects/overview" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.name}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
