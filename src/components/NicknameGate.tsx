import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Theme } from '../types.ts'

type NicknameGateProps = {
  initialNickname: string
  maxLength: number
  onSubmit: (nickname: string) => void
  theme: Theme
  onToggleTheme: () => void
}

export function NicknameGate({
  initialNickname,
  maxLength,
  onSubmit,
  theme,
  onToggleTheme,
}: NicknameGateProps) {
  const [nickname, setNickname] = useState(initialNickname)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNickname = nickname.trim()

    if (!nextNickname) {
      setError('Choose a nickname to enter the chat.')
      return
    }

    if (nextNickname.length > maxLength) {
      setError(`Nickname must be ${maxLength} characters or fewer.`)
      return
    }

    setError(null)
    onSubmit(nextNickname)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_32%),linear-gradient(180deg,var(--app-bg),var(--app-bg-muted))] px-4 text-[var(--text-primary)]">
      <button
        className="absolute right-4 top-4 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        onClick={onToggleTheme}
        type="button"
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>

      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
          Fake-Slack
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Join the conversation</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Pick a nickname and jump into the live rooms. No accounts, no passwords.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Nickname
            </span>
            <input
              autoComplete="nickname"
              autoFocus
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3 text-base outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              maxLength={maxLength}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="e.g. miles"
              value={nickname}
            />
          </label>

          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

          <button
            className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            type="submit"
          >
            Join chat
          </button>
        </form>
      </div>
    </div>
  )
}
