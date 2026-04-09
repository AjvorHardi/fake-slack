import type { Room, Theme } from '../types.ts'

type ChatHeaderProps = {
  room: Room | null
  onOpenSidebar: () => void
  theme: Theme
  onToggleTheme: () => void
}

export function ChatHeader({
  room,
  onOpenSidebar,
  theme,
  onToggleTheme,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--panel)] px-4 py-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] md:hidden"
          onClick={onOpenSidebar}
          type="button"
        >
          Rooms
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-[var(--text-primary)]">
            {room ? `# ${room.name}` : 'Loading room...'}
          </h1>

          {room?.description ? (
            <p className="truncate text-sm text-[var(--text-secondary)]">{room.description}</p>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              Live conversation updates in real time
            </p>
          )}
        </div>
      </div>

      <button
        className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
        onClick={onToggleTheme}
        type="button"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  )
}
