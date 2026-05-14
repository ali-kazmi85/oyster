import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  github_owner: z.string().min(1).optional(),
  github_repo: z.string().min(1).optional(),
  pat_token: z.string().min(1).optional(),
  agent_base_url: z.string().optional().nullable(),
  agent_model: z.string().optional().nullable(),
  agent_api_key: z.string().optional().nullable(),
  validation_command: z.string().optional().nullable(),
  max_iterations: z.number().int().min(1).max(50).optional(),
  max_concurrent_runs: z.number().int().min(1).max(5).optional(),
  poll_interval_seconds: z.number().int().min(10).max(3600).optional(),
  bot_login: z.string().optional().nullable(),
})

type Params = { params: Promise<{ projectId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { projectId } = await params
  const project = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { projectId } = await params
  const body = await request.json()
  const parsed = updateProjectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get()

  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const [updated] = await db
    .update(schema.projects)
    .set(parsed.data)
    .where(eq(schema.projects.id, projectId))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { projectId } = await params

  const existing = await db
    .select()
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .get()

  if (!existing) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  await db.delete(schema.projects).where(eq(schema.projects.id, projectId))

  return new NextResponse(null, { status: 204 })
}
