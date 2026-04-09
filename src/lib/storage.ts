import type { Theme } from '../types.ts'

const ACTIVE_ROOM_ID_KEY = 'fake-slack.active_room_id'
const CLIENT_ID_KEY = 'fake-slack.client_id'
const NICKNAME_KEY = 'fake-slack.nickname'
const THEME_KEY = 'fake-slack.theme'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getNickname() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(NICKNAME_KEY)
}

export function setNickname(nickname: string) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(NICKNAME_KEY, nickname)
}

export function getOrCreateClientId() {
  if (!canUseStorage()) {
    return crypto.randomUUID()
  }

  const existingClientId = window.localStorage.getItem(CLIENT_ID_KEY)

  if (existingClientId) {
    return existingClientId
  }

  const nextClientId = crypto.randomUUID()
  window.localStorage.setItem(CLIENT_ID_KEY, nextClientId)

  return nextClientId
}

export function getActiveRoomId() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(ACTIVE_ROOM_ID_KEY)
}

export function setActiveRoomId(roomId: string) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(ACTIVE_ROOM_ID_KEY, roomId)
}

export function getTheme(): Theme {
  if (!canUseStorage()) {
    return 'light'
  }

  const storedTheme = window.localStorage.getItem(THEME_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(THEME_KEY, theme)
}
