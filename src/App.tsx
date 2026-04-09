import { useEffect, useMemo, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { ChatHeader } from './components/ChatHeader.tsx'
import { CreateRoomModal } from './components/CreateRoomModal.tsx'
import { MessageComposer } from './components/MessageComposer.tsx'
import { MessageList } from './components/MessageList.tsx'
import { NicknameGate } from './components/NicknameGate.tsx'
import { Sidebar } from './components/Sidebar.tsx'
import { createRoom, fetchRecentMessages, fetchRooms, insertMessage } from './lib/chat.ts'
import { supabase } from './lib/supabase.ts'
import {
  getActiveRoomId,
  getNickname,
  getOrCreateClientId,
  getTheme,
  setActiveRoomId,
  setNickname,
  setTheme,
} from './lib/storage.ts'
import type { CreateRoomInput, Message, Room } from './types.ts'
import type { Theme } from './types.ts'

function sortRooms(rooms: Room[]) {
  return [...rooms].sort((left, right) => {
    if (left.is_default !== right.is_default) {
      return left.is_default ? -1 : 1
    }

    return left.name.localeCompare(right.name, undefined, {
      sensitivity: 'base',
    })
  })
}

function mergeRooms(current: Room[], incoming: Room[]) {
  const roomMap = new Map(current.map((room) => [room.id, room]))

  for (const room of incoming) {
    roomMap.set(room.id, room)
  }

  return sortRooms([...roomMap.values()])
}

function sortMessages(messages: Message[]) {
  return [...messages].sort((left, right) => {
    const createdAtDiff =
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime()

    if (createdAtDiff !== 0) {
      return createdAtDiff
    }

    return left.id.localeCompare(right.id)
  })
}

function mergeMessages(current: Message[], incoming: Message[]) {
  const messageMap = new Map(current.map((message) => [message.id, message]))

  for (const message of incoming) {
    messageMap.set(message.id, message)
  }

  return sortMessages([...messageMap.values()])
}

function resolveActiveRoom(rooms: Room[], preferredRoomId: string | null) {
  if (preferredRoomId) {
    const matchedRoom = rooms.find((room) => room.id === preferredRoomId)

    if (matchedRoom) {
      return matchedRoom
    }
  }

  return rooms.find((room) => room.is_default) ?? rooms[0] ?? null
}

function App() {
  const [nicknameState, setNicknameState] = useState<string | null>(() => getNickname())
  const [clientId] = useState(() => getOrCreateClientId())
  const [theme, setThemeState] = useState<Theme>(() => getTheme())
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState<string | null>(null)
  const [activeRoomId, setActiveRoomState] = useState<string | null>(() => getActiveRoomId())
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) ?? null,
    [activeRoomId, rooms],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    setTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!nicknameState) {
      return
    }

    let isCancelled = false

    setRoomsLoading(true)
    setRoomsError(null)

    const roomsChannel = supabase
      .channel('rooms-list')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rooms',
        },
        (payload) => {
          const nextRoom = payload.new as Room

          setRooms((currentRooms) => mergeRooms(currentRooms, [nextRoom]))
        },
      )
      .subscribe()

    void fetchRooms()
      .then((fetchedRooms) => {
        if (isCancelled) {
          return
        }

        setRooms((currentRooms) => mergeRooms(currentRooms, fetchedRooms))
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return
        }

        setRoomsError(error instanceof Error ? error.message : 'Unable to load rooms.')
      })
      .finally(() => {
        if (!isCancelled) {
          setRoomsLoading(false)
        }
      })

    return () => {
      isCancelled = true
      void supabase.removeChannel(roomsChannel)
    }
  }, [nicknameState])

  useEffect(() => {
    if (!rooms.length) {
      return
    }

    const currentRoom = rooms.find((room) => room.id === activeRoomId)

    if (currentRoom) {
      return
    }

    const nextRoom = resolveActiveRoom(rooms, getActiveRoomId())

    if (!nextRoom) {
      return
    }

    setActiveRoomState(nextRoom.id)
    setActiveRoomId(nextRoom.id)
  }, [activeRoomId, rooms])

  useEffect(() => {
    if (!nicknameState || !activeRoomId) {
      setMessages([])
      return
    }

    let isCancelled = false
    let roomChannel: RealtimeChannel | null = null

    setMessagesLoading(true)
    setMessageError(null)
    setMessages([])

    roomChannel = supabase
      .channel(`room:${activeRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${activeRoomId}`,
        },
        (payload) => {
          const nextMessage = payload.new as Message

          setMessages((currentMessages) => mergeMessages(currentMessages, [nextMessage]))
        },
      )
      .subscribe()

    void fetchRecentMessages(activeRoomId)
      .then((fetchedMessages) => {
        if (isCancelled) {
          return
        }

        setMessages((currentMessages) => mergeMessages(currentMessages, fetchedMessages))
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return
        }

        setMessageError(error instanceof Error ? error.message : 'Unable to load messages.')
      })
      .finally(() => {
        if (!isCancelled) {
          setMessagesLoading(false)
        }
      })

    return () => {
      isCancelled = true

      if (roomChannel) {
        void supabase.removeChannel(roomChannel)
      }
    }
  }, [activeRoomId, nicknameState])

  function handleNicknameSubmit(nextNickname: string) {
    setNickname(nextNickname)
    setNicknameState(nextNickname)
  }

  function handleThemeToggle() {
    setThemeState((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  function handleRoomSelect(roomId: string) {
    setActiveRoomId(roomId)
    setActiveRoomState(roomId)
    setIsMobileSidebarOpen(false)
    setMessageError(null)
  }

  async function handleCreateRoom(input: CreateRoomInput) {
    const room = await createRoom(input)

    setRooms((currentRooms) => mergeRooms(currentRooms, [room]))
    handleRoomSelect(room.id)
    setIsCreateRoomOpen(false)
  }

  async function handleSendMessage(body: string) {
    if (!activeRoomId || !nicknameState || sendingMessage) {
      return false
    }

    setSendingMessage(true)
    setMessageError(null)

    try {
      const message = await insertMessage({
        roomId: activeRoomId,
        clientId,
        nicknameSnapshot: nicknameState,
        body,
      })

      setMessages((currentMessages) => mergeMessages(currentMessages, [message]))
      return true
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'Unable to send message.')
      return false
    } finally {
      setSendingMessage(false)
    }
  }

  if (!nicknameState) {
    return (
      <NicknameGate
        initialNickname=""
        maxLength={24}
        onSubmit={handleNicknameSubmit}
        theme={theme}
        onToggleTheme={handleThemeToggle}
      />
    )
  }

  return (
    <>
      <div className="flex min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
        <Sidebar
          activeRoomId={activeRoomId}
          isOpen={isMobileSidebarOpen}
          nickname={nicknameState}
          onClose={() => setIsMobileSidebarOpen(false)}
          onCreateRoom={() => setIsCreateRoomOpen(true)}
          onSelectRoom={handleRoomSelect}
          rooms={rooms}
          roomsLoading={roomsLoading}
        />

        <main className="flex min-h-screen min-w-0 flex-1 flex-col">
          <ChatHeader
            room={activeRoom}
            onOpenSidebar={() => setIsMobileSidebarOpen(true)}
            theme={theme}
            onToggleTheme={handleThemeToggle}
          />

          {roomsError ? (
            <div className="border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--danger)] md:px-6">
              {roomsError}
            </div>
          ) : null}

          {messageError ? (
            <div className="border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--danger)] md:px-6">
              {messageError}
            </div>
          ) : null}

          <MessageList
            clientId={clientId}
            isLoading={messagesLoading}
            messages={messages}
            roomName={activeRoom?.name ?? 'Chat'}
          />

          <MessageComposer
            disabled={!activeRoom}
            isSending={sendingMessage}
            maxLength={1000}
            onSend={handleSendMessage}
          />
        </main>
      </div>

      {isCreateRoomOpen ? (
        <CreateRoomModal
          maxDescriptionLength={120}
          maxNameLength={32}
          onClose={() => setIsCreateRoomOpen(false)}
          onSubmit={handleCreateRoom}
        />
      ) : null}
    </>
  )
}

export default App
