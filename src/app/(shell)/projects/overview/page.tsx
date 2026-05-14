export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db, schema } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, GitBranch, Clock } from 'lucide-react'

export default async function ProjectsOverviewPage() {
  const projects = await db.select().from(schema.projects)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Software Factory projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <GitBranch className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Add your first project to start using Software Factory for automated issue resolution.
          </p>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              Add your first project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/p/${project.id}`}>
              <Card className="hover:border-foreground/20 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {project.github_owner}/{project.github_repo}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {(project.awaiting_dispatch_count ?? 0) > 0 && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {project.awaiting_dispatch_count} awaiting
                      </Badge>
                    )}
                    {(project.needs_grooming_count ?? 0) > 0 && (
                      <Badge variant="outline">
                        {project.needs_grooming_count} needs grooming
                      </Badge>
                    )}
                    {(project.awaiting_dispatch_count ?? 0) === 0 &&
                      (project.needs_grooming_count ?? 0) === 0 && (
                        <span className="text-xs text-muted-foreground">No pending issues</span>
                      )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
