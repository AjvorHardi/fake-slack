import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateRoomInput } from '../types.ts'

type CreateRoomModalProps = {
  maxDescriptionLength: number
  maxNameLength: number
  onClose: () => void
  onSubmit: (input: CreateRoomInput) => Promise<void>
}

export function CreateRoomModal({
  maxDescriptionLength,
  maxNameLength,
  onClose,
  onSubmit,
}: CreateRoomModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextName = name.trim()
    const nextDescription = description.trim()

    if (!nextName) {
      setError('Room name is required.')
      return
    }

    if (nextName.length > maxNameLength) {
      setError(`Room name must be ${maxNameLength} characters or fewer.`)
      return
    }

    if (nextDescription.length > maxDescriptionLength) {
      setError(`Description must be ${maxDescriptionLength} characters or fewer.`)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        name: nextName,
        description: nextDescription || null,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to create the room.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              New room
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
              Create a chat room
            </h2>
          </div>

          <button
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Room name
            </span>
            <input
              autoFocus
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              maxLength={maxNameLength}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Product"
              value={name}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Description
            </span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              maxLength={maxDescriptionLength}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional short room context"
              value={description}
            />
          </label>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Description is optional</span>
            <span>
              {description.trim().length}/{maxDescriptionLength}
            </span>
          </div>

          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              className="rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? 'Creating...' : 'Create room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
