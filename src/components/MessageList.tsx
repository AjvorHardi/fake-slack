import { useEffect, useMemo, useRef } from 'react'
import type { ChatItem, ChatMessageItem } from '../types.ts'

type MessageListProps = {
  items: ChatItem[]
  clientId: string
  isLoading: boolean
  roomName: string
}

type MessageGroup = {
  authorKey: string
  clientId: string
  nickname: string
  items: ChatItem[]
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function MessageList({
  items,
  clientId,
  isLoading,
  roomName,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const groups = useMemo(() => {
    return items.reduce<MessageGroup[]>((accumulator, item) => {
      if (item.kind === 'system') {
        accumulator.push({
          authorKey: `system:${item.id}`,
          clientId: '',
          nickname: '',
          items: [item],
        })
        return accumulator
      }

      const authorKey = `${item.message.client_id}:${item.message.nickname_snapshot}`
      const lastGroup = accumulator[accumulator.length - 1]

      if (
        lastGroup &&
        lastGroup.authorKey === authorKey &&
        lastGroup.items[0]?.kind === 'message'
      ) {
        lastGroup.items.push(item)
        return accumulator
      }

      accumulator.push({
        authorKey,
        clientId: item.message.client_id,
        nickname: item.message.nickname_snapshot,
        items: [item],
      })

      return accumulator
    }, [])
  }, [items])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [items])

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-[var(--app-bg-muted)] px-3 py-4 md:px-6">
      {isLoading && !items.length ? (
        <div className="flex h-full items-center justify-center text-sm text-[var(--text-muted)]">
          Loading messages...
        </div>
      ) : null}

      {!isLoading && !items.length ? (
        <div className="flex h-full items-center justify-center px-4 text-center">
          <div className="max-w-sm rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-8">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              #{roomName}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
              No messages yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Start the room with a short hello. New messages will appear here instantly.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        {groups.map((group) => {
          if (group.items[0]?.kind === 'system') {
            const systemItem = group.items[0]

            return (
              <div className="flex justify-center" key={systemItem.id}>
                <div className="rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-2 text-xs font-medium text-[var(--text-muted)]">
                  {systemItem.body}
                </div>
              </div>
            )
          }

          const isOwnGroup = group.clientId === clientId
          const messageItems = group.items as ChatMessageItem[]

          return (
            <div
              className={['flex flex-col gap-1', isOwnGroup ? 'items-end' : 'items-start'].join(
                ' ',
              )}
              key={`${group.authorKey}:${group.items[0].id}`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {group.nickname}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTime(group.items[0].created_at)}
                </span>
              </div>

              <div className="flex max-w-[85%] flex-col gap-1 md:max-w-[70%]">
                {messageItems.map((item) => (
                  <div
                    className={[
                      'rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]',
                      isOwnGroup
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--panel)] text-[var(--text-primary)]',
                    ].join(' ')}
                    key={item.id}
                  >
                    <p className="whitespace-pre-wrap break-words">{item.message.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>
    </section>
  )
}
