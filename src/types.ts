export type Theme = 'light' | 'dark'

export type Room = {
  id: string
  name: string
  description: string | null
  is_default: boolean
  created_at: string
}

export type Message = {
  id: string
  room_id: string
  client_id: string
  nickname_snapshot: string
  body: string
  created_at: string
}

export type ChatSystemEvent = {
  kind: 'system'
  id: string
  body: string
  created_at: string
}

export type ChatMessageItem = {
  kind: 'message'
  id: string
  created_at: string
  message: Message
}

export type ChatItem = ChatMessageItem | ChatSystemEvent

export type OnlineUser = {
  clientId: string
  nickname: string
  onlineAt: string
  isCurrentUser: boolean
}

export type TypingUser = {
  clientId: string
  nickname: string
}

export type CreateRoomInput = {
  name: string
  description: string | null
}

export type SendMessageInput = {
  roomId: string
  clientId: string
  nicknameSnapshot: string
  body: string
}
