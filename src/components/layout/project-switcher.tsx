'use client'

import { useParams, useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function ProjectSwitcher() {
  const params = useParams()
  const router = useRouter()
  const { projects, isLoading } = useProjects()

  const currentProjectId = params?.projectId as string | undefined

  const handleChange = (value: string) => {
    if (value === '__new__') {
      router.push('/projects/new')
    } else {
      router.push(`/p/${value}`)
    }
  }

  if (isLoading) {
    return (
      <div className="px-2 py-1 text-sm text-muted-foreground">Loading projects...</div>
    )
  }

  return (
    <Select value={currentProjectId ?? ''} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
        <SelectItem value="__new__">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Plus className="h-4 w-4" />
            Add Project
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
