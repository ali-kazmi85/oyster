import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import os from 'os'
import path from 'path'

const createProjectSchema = z.object({
  name: z.string().min(1),
  github_owner: z.string().min(1),
  github_repo: z.string().min(1),
  pat_token: z.string().min(1),
  agent_base_url: z.string().optional(),
  agent_model: z.string().optional(),
  agent_api_key: z.string().optional(),
  validation_command: z.string().optional(),
  max_iterations: z.number().int().min(1).max(50).optional(),
  max_concurrent_runs: z.number().int().min(1).max(5).optional(),
  poll_interval_seconds: z.number().int().min(10).max(3600).optional(),
})

export async function GET() {
  const projects = await db.select().from(schema.projects)
  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = createProjectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const id = nanoid()
  const now = Math.floor(Date.now() / 1000)

  const { github_owner, github_repo } = parsed.data
  const local_path = path.join(os.homedir(), '.oyster', 'repos', `${github_owner}__${github_repo}`)

  const [project] = await db
    .insert(schema.projects)
    .values({
      id,
      ...parsed.data,
      local_path,
      created_at: now,
    })
    .returning()

  return NextResponse.json(project, { status: 201 })
}
