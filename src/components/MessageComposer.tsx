import { useState } from 'react'
import type { KeyboardEvent } from 'react'

type MessageComposerProps = {
  disabled: boolean
  isSending: boolean
  maxLength: number
  onSend: (body: string) => Promise<boolean>
}

export function MessageComposer({
  disabled,
  isSending,
  maxLength,
  onSend,
}: MessageComposerProps) {
  const [body, setBody] = useState('')

  async function submitMessage() {
    const nextBody = body.trim()

    if (!nextBody || disabled || isSending) {
      return
    }

    const didSend = await onSend(nextBody)

    if (didSend) {
      setBody('')
    }
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await submitMessage()
    }
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--panel)] px-3 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Message</span>
          <textarea
            className="max-h-40 min-h-[3.25rem] w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled || isSending}
            maxLength={maxLength}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Select a room to chat' : 'Message the room'}
            rows={1}
            value={body}
          />
        </label>

        <button
          className="rounded-3xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isSending || !body.trim()}
          onClick={() => void submitMessage()}
          type="button"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
