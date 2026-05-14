export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { ProjectForm } from '@/components/projects/project-form'

interface SettingsPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectSettingsPage({ params }: SettingsPageProps) {
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure {project.name}
        </p>
      </div>
      <ProjectForm project={project} />
    </div>
  )
}
