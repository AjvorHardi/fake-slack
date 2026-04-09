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
