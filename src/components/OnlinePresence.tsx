import { useState } from 'react'
import type { OnlineUser } from '../types.ts'

type OnlinePresenceProps = {
  users: OnlineUser[]
}

export function OnlinePresence({ users }: OnlinePresenceProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        type="button"
      >
        Online {users.length}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.65rem)] z-20 w-72 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="border-b border-[var(--border)] px-2 pb-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Online now
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Currently present in this room
            </p>
          </div>

          <ul className="mt-3 space-y-1">
            {users.map((user) => (
              <li
                className="flex items-center justify-between rounded-2xl px-2 py-2"
                key={user.clientId}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {user.nickname}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {user.isCurrentUser ? 'You' : 'Guest'}
                  </p>
                </div>

                <span className="ml-3 inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
