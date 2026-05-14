import simpleGit from 'simple-git'
import path from 'path'

export class WorktreeManager {
  constructor(private repoPath: string) {}

  async create(issueNumber: number): Promise<{ worktreePath: string; branchName: string }> {
    const git = simpleGit(this.repoPath)
    const branchName = `factory/issue-${issueNumber}`
    const worktreePath = path.join(this.repoPath, '..', `worktree-issue-${issueNumber}`)
    await git.raw(['worktree', 'add', '-b', branchName, worktreePath])
    return { worktreePath, branchName }
  }

  async cleanup(worktreePath: string): Promise<void> {
    const git = simpleGit(this.repoPath)
    await git.raw(['worktree', 'remove', '--force', worktreePath])
  }
}
