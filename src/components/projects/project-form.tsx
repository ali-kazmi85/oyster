'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Project } from '@/types'

interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!project

  const [formData, setFormData] = useState({
    name: project?.name ?? '',
    github_owner: project?.github_owner ?? '',
    github_repo: project?.github_repo ?? '',
    pat_token: project?.pat_token ?? '',
    agent_base_url: project?.agent_base_url ?? '',
    agent_model: project?.agent_model ?? '',
    agent_api_key: project?.agent_api_key ?? '',
    validation_command: project?.validation_command ?? 'npm test',
    max_iterations: project?.max_iterations ?? 10,
    max_concurrent_runs: project?.max_concurrent_runs ?? 1,
    poll_interval_seconds: project?.poll_interval_seconds ?? 30,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const payload = {
      ...formData,
      agent_base_url: formData.agent_base_url || undefined,
      agent_model: formData.agent_model || undefined,
      agent_api_key: formData.agent_api_key || undefined,
    }

    try {
      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ? JSON.stringify(data.error) : 'An error occurred')
        return
      }

      const saved: Project = await res.json()
      router.push(`/p/${saved.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Basic information about your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Awesome Project"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_owner">GitHub Owner</Label>
              <Input
                id="github_owner"
                name="github_owner"
                value={formData.github_owner}
                onChange={handleChange}
                placeholder="acme-corp"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_repo">GitHub Repo</Label>
              <Input
                id="github_repo"
                name="github_repo"
                value={formData.github_repo}
                onChange={handleChange}
                placeholder="my-repo"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="pat_token">GitHub PAT Token</Label>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-72 space-y-2 text-xs leading-relaxed">
                    <p className="font-semibold">Creating a fine-grained PAT:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</li>
                      <li>Click <span className="font-medium">Generate new token</span></li>
                      <li>Set <span className="font-medium">Repository access</span> to this repo</li>
                      <li>Under <span className="font-medium">Permissions</span>, enable read &amp; write for: Contents, Issues, Pull requests</li>
                      <li>Click <span className="font-medium">Generate token</span> and copy it here</li>
                    </ol>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="pat_token"
              name="pat_token"
              type="password"
              value={formData.pat_token}
              onChange={handleChange}
              placeholder="ghp_..."
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>Optional custom model settings for the AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agent_base_url">Agent Base URL</Label>
            <Input
              id="agent_base_url"
              name="agent_base_url"
              value={formData.agent_base_url}
              onChange={handleChange}
              placeholder="https://api.anthropic.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent_model">Agent Model</Label>
            <Input
              id="agent_model"
              name="agent_model"
              value={formData.agent_model}
              onChange={handleChange}
              placeholder="claude-opus-4-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent_api_key">Agent API Key</Label>
            <Input
              id="agent_api_key"
              name="agent_api_key"
              type="password"
              value={formData.agent_api_key}
              onChange={handleChange}
              placeholder="sk-ant-..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Settings</CardTitle>
          <CardDescription>Configure how the agent runs issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="validation_command">Validation Command</Label>
            <Input
              id="validation_command"
              name="validation_command"
              value={formData.validation_command}
              onChange={handleChange}
              placeholder="npm test"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_iterations">Max Iterations</Label>
              <Input
                id="max_iterations"
                name="max_iterations"
                type="number"
                min={1}
                max={50}
                value={formData.max_iterations}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_concurrent_runs">Max Concurrent Runs</Label>
              <Input
                id="max_concurrent_runs"
                name="max_concurrent_runs"
                type="number"
                min={1}
                max={5}
                value={formData.max_concurrent_runs}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poll_interval_seconds">Poll Interval (s)</Label>
              <Input
                id="poll_interval_seconds"
                name="poll_interval_seconds"
                type="number"
                min={10}
                max={3600}
                value={formData.poll_interval_seconds}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
