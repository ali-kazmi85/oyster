import { ProjectForm } from '@/components/projects/project-form'

export default function NewProjectPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Project</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Connect a GitHub repository to Software Factory
        </p>
      </div>
      <ProjectForm />
    </div>
  )
}
