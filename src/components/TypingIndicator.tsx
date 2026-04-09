import type { TypingUser } from '../types.ts'

type TypingIndicatorProps = {
  users: TypingUser[]
}

function buildMessage(users: TypingUser[]) {
  if (users.length === 0) {
    return ''
  }

  if (users.length === 1) {
    return `${users[0].nickname} is typing...`
  }

  if (users.length === 2) {
    return `${users[0].nickname} and ${users[1].nickname} are typing...`
  }

  return `${users.length} people are typing...`
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  return (
    <div className="border-t border-[var(--border)] bg-[var(--panel)] px-3 py-2 md:px-6">
      <div className="mx-auto flex min-h-6 w-full max-w-4xl items-center">
        {users.length ? (
          <p className="text-sm text-[var(--text-secondary)]">{buildMessage(users)}</p>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
