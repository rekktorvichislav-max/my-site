# CotaxSite

Website for Cotax Client: landing page, user accounts, HWID licensing and client download.

## Stack

- Next.js 15 (App Router) + React 19
- SQLite via built-in `node:sqlite` (no native compilation needed)
- bcryptjs for password hashing
- Cookie-based sessions (30 days)

## Setup

```bash
npm install
copy .env.example .env.local   # then fill in secrets
npm run dev                    # http://localhost:3000
```

## Env vars

| Var | Purpose |
| --- | --- |
| `JWT_SECRET` | Any long random string (used to derive nothing today, reserved) |
| `CLIENT_SECRET` | Shared secret the Minecraft client must send to `/api/client/validate` |
| `CLIENT_FILE_PATH` | Path to the client `.jar`; enables `/api/download` |
| `DATABASE_PATH` | SQLite file location (default `./data/cotax.db`) |

## API

- `POST /api/register` — create account, returns session token
- `POST /api/login` — log in (username or email)
- `POST /api/logout` — invalidate session
- `GET /api/me` — current user
- `POST /api/hwid` — bind HWID to account
- `DELETE /api/hwid` — unbind HWID
- `PUT /api/hwid` `{action:"reset_hwid"}` — unbind + sign out all sessions
- `GET /api/hwid?hwid=...` — look up account by HWID
- `POST /api/client/validate` `{hwid, secret}` — license check used by the Minecraft client
- `GET /api/download` — download client jar (requires bound HWID)

## Client integration

The Minecraft client should call `/api/client/validate` on startup:

```http
POST /api/client/validate
Content-Type: application/json

{"hwid":"<HARDWARE_ID>","secret":"<CLIENT_SECRET>"}
```

- `200 {ok:true, user:{username}}` — licensed
- `200 {ok:false, reason:"HWID not bound"}` — not licensed
