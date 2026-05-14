export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Run migrations
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')
    const { db } = await import('./src/lib/db')
    migrate(db, { migrationsFolder: './src/lib/db/migrations' })

    // Validate claude CLI
    const { execa } = await import('execa')
    try {
      await execa('claude', ['--version'])
    } catch {
      console.warn('[Software Factory] WARNING: claude CLI not found in PATH. Agent runs will fail.')
    }
  }
}
