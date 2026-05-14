import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HelloPage() {
  const timestamp = new Date().toISOString()

  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Hello, World!</CardTitle>
          <CardDescription>
            Issue #1 completed successfully. The full worktree → code → PR
            pipeline is operational.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Rendered at:{' '}
            <span className="font-mono text-foreground">{timestamp}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
