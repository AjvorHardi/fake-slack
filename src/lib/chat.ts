import type { CreateRoomInput, Message, Room, SendMessageInput } from '../types.ts'
import { supabase } from './supabase.ts'

function fail(message: string) {
  throw new Error(message)
}

export async function fetchRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    fail(error.message)
  }

  return (data ?? []) as Room[]
}

export async function createRoom(input: CreateRoomInput) {
  const payload = {
    name: input.name.trim(),
    description: input.description ? input.description.trim() : null,
  }

  const { data, error } = await supabase.from('rooms').insert(payload).select().single()

  if (error) {
    fail(error.message)
  }

  return data as Room
}

export async function fetchRecentMessages(roomId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(20)

  if (error) {
    fail(error.message)
  }

  return ((data ?? []) as Message[]).reverse()
}

export async function insertMessage(input: SendMessageInput) {
  const payload = {
    room_id: input.roomId,
    client_id: input.clientId,
    nickname_snapshot: input.nicknameSnapshot.trim(),
    body: input.body.trim(),
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select()
    .single()

  if (error) {
    fail(error.message)
  }

  return data as Message
}
