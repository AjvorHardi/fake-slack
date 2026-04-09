import type { Room } from '../types.ts'

type SidebarProps = {
  activeRoomId: string | null
  isOpen: boolean
  nickname: string
  onClose: () => void
  onCreateRoom: () => void
  onSelectRoom: (roomId: string) => void
  rooms: Room[]
  roomsLoading: boolean
}

export function Sidebar({
  activeRoomId,
  isOpen,
  nickname,
  onClose,
  onCreateRoom,
  onSelectRoom,
  rooms,
  roomsLoading,
}: SidebarProps) {
  return (
    <>
      <div
        className={[
          'fixed inset-0 z-30 bg-slate-950/45 transition md:hidden',
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-[18.5rem] max-w-[85vw] flex-col border-r border-[var(--border)] bg-[var(--sidebar-bg)] transition-transform md:static md:z-auto md:max-w-none md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Rooms
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Fake-Slack</h2>
          </div>

          <button
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            onClick={onCreateRoom}
            type="button"
          >
            + New
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {roomsLoading && !rooms.length ? (
            <p className="px-3 py-2 text-sm text-[var(--text-muted)]">Loading rooms...</p>
          ) : null}

          <ul className="space-y-1">
            {rooms.map((room) => {
              const isActive = room.id === activeRoomId

              return (
                <li key={room.id}>
                  <button
                    className={[
                      'w-full rounded-2xl px-3 py-2.5 text-left transition',
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--panel)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                    onClick={() => onSelectRoom(room.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium"># {room.name}</span>
                      {room.is_default ? (
                        <span className="rounded-full bg-[var(--panel)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          Default
                        </span>
                      ) : null}
                    </div>

                    {room.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
                        {room.description}
                      </p>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <div className="rounded-2xl bg-[var(--panel)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Signed in as
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)]">
              {nickname}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
