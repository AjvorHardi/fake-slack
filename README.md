# Fake-Slack

Guest multi-room chat built with React, Vite, TypeScript, Tailwind, and Supabase Realtime.

## What It Does

- Join with a nickname, no account required
- Browse and switch rooms
- Create new rooms
- Send messages with latest-20 history loading
- See online presence per room
- See typing indicators
- See join/leave room events

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Supabase (`rooms`, `messages`, Realtime, RLS)
- Vercel for hosting

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Set the required variables in `.env.local`:

   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Setup

This app expects a Supabase project with:

- a `rooms` table
- a `messages` table
- Row Level Security enabled
- public `select` and `insert` access for `anon`
- `rooms` and `messages` added to the `supabase_realtime` publication
- at least one default room with `is_default = true`

The repo includes an idempotent bootstrap script:

- [supabase/001_bootstrap.sql](supabase/001_bootstrap.sql)

Run it once in the Supabase SQL Editor for the target project.

## Environment Variables

Required in both local development and Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are public browser variables and are expected to be exposed to the client. Do not use the Supabase service role key in this app.

## Scripts

- `npm run dev`: start local Vite dev server
- `npm run build`: type-check and build production assets
- `npm run lint`: run ESLint
- `npm run preview`: serve the built app locally

## Deploy To Vercel

Recommended flow:

1. Push the repo to GitHub.
2. In Vercel, import the repository as a new project.
3. Let Vercel auto-detect the Vite framework settings.
4. Add these environment variables in Vercel for `Production`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Add the same variables for `Preview`.
6. Deploy `main` to get the production `vercel.app` URL.

For this MVP, using the same Supabase project for both `Production` and `Preview` is acceptable. The tradeoff is that preview deployments write to the same database as production.

## Manual Verification

Run these checks locally and again on the Vercel deployment:

- open the app and enter a nickname
- verify nickname persists after refresh
- verify the default room loads when no room is stored
- create a room and switch into it
- send a message and confirm it appears immediately
- refresh and confirm the latest 20 messages load
- open a second browser session and verify:
  - realtime message delivery
  - online presence
  - typing indicator
  - join/leave system events

## Notes

- The app uses the Supabase `anon` key from the browser.
- No authentication flow is implemented in phase 1.
- This repo currently has no automated tests; validation is lint, build, and manual multi-session verification.
