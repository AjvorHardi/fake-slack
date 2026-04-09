import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

type MessageComposerProps = {
  disabled: boolean
  isSending: boolean
  maxLength: number
  onSend: (body: string) => Promise<boolean>
  onTypingStart: () => void
  onTypingStop: () => void
}

export function MessageComposer({
  disabled,
  isSending,
  maxLength,
  onSend,
  onTypingStart,
  onTypingStop,
}: MessageComposerProps) {
  const [body, setBody] = useState('')
  const isTypingRef = useRef(false)
  const lastTypingPingAtRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const timeoutRef = useRef<number | null>(null)

  function clearTypingTimeout() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function stopTyping() {
    clearTypingTimeout()

    if (!isTypingRef.current) {
      return
    }

    isTypingRef.current = false
    onTypingStop()
  }

  function scheduleTypingStop() {
    clearTypingTimeout()

    timeoutRef.current = window.setTimeout(() => {
      stopTyping()
    }, 1800)
  }

  function handleBodyChange(nextBody: string) {
    setBody(nextBody)

    if (!nextBody.trim() || disabled || isSending) {
      stopTyping()
      return
    }

    const now = Date.now()

    if (!isTypingRef.current) {
      isTypingRef.current = true
      lastTypingPingAtRef.current = now
      onTypingStart()
    } else if (now - lastTypingPingAtRef.current >= 1200) {
      lastTypingPingAtRef.current = now
      onTypingStart()
    }

    scheduleTypingStop()
  }

  async function submitMessage() {
    const nextBody = body.trim()

    if (!nextBody || disabled || isSending) {
      return
    }

    stopTyping()
    const didSend = await onSend(nextBody)

    if (didSend) {
      setBody('')
      requestAnimationFrame(() => {
        textareaRef.current?.focus()
      })
    }
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await submitMessage()
    }
  }

  useEffect(() => {
    return () => {
      clearTypingTimeout()

      if (!isTypingRef.current) {
        return
      }

      isTypingRef.current = false
      onTypingStop()
    }
  }, [onTypingStop])

  return (
    <div className="border-t border-[var(--border)] bg-[var(--panel)] px-3 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Message</span>
          <textarea
            ref={textareaRef}
            className="max-h-40 min-h-[3.25rem] w-full resize-none rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled || isSending}
            maxLength={maxLength}
            onBlur={stopTyping}
            onChange={(event) => handleBodyChange(event.target.value)}
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
