# Repository Guidelines

## Project Structure & Module Organization
This repository is an MVP React 19 + Vite + TypeScript + Tailwind app for a guest, multi-room chat. Keep the structure lean. Phase 1 code should stay under `src/` with:
- `App.tsx` for top-level state, boot flow, room switching, and Realtime wiring
- `components/` for UI pieces such as `Sidebar`, `MessageList`, `MessageComposer`, and `NicknameGate`
- `lib/` for concrete helpers only: `supabase.ts`, `storage.ts`, and `chat.ts`
- `types.ts` for shared `Room` and `Message` types

Do not introduce React Router, providers, or thin wrapper layers unless they solve a current problem.

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start the local Vite app
- `npm run build`: run TypeScript checks and create the production build
- `npm run preview`: serve the built app locally
- `npm run lint`: run ESLint

For backend setup, keep Supabase SQL in a single migration or setup script covering tables, policies, seed data, and Realtime publication changes.

## Coding Style & Naming Conventions
Use TypeScript function components, 2-space indentation, single quotes, and minimal abstractions. Use `PascalCase` for component files and `camelCase` for functions, state, and helpers. Keep most app state in `App.tsx` for this MVP. Prefer explicit props over shared context.

Store only current MVP data in `localStorage`: `client_id`, `nickname`, `theme`, and `active_room_id`.

## Data & Supabase Rules
Only two tables are in scope: `rooms` and `messages`.
- `rooms.name` max length: `32`
- `rooms.description` max length: `120`, store empty values as `NULL`
- `messages.nickname_snapshot` max length: `24`
- `messages.body` max length: `1000`

Use unauthenticated access through the Supabase `anon` role with RLS enabled. Allow public `select` and `insert` only. Do not add public `update` or `delete` policies in phase 1. Fallback room selection must use `is_default = true`, not a hardcoded room name.

## Testing Guidelines
There is no automated test suite yet. Validate every change with `npm run lint`, `npm run build`, and manual checks in two browser sessions. Test nickname persistence, default-room fallback, room creation, room switching, latest-20 message fetches, and Realtime delivery.

## Commit & Pull Request Guidelines
Use short scoped commits such as `chat: add room subscription flow`. PRs should describe the user-facing change, note any Supabase schema or policy updates, and include screenshots for layout changes.
