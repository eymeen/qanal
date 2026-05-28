# Qanal

> The universal open-source hosting panel — alternative to cPanel, Plesk, aapanel, hPanel.

**Status: MVP — work in progress**

## Features (MVP)

- Connect VPS servers via SSH private key
- Manage nginx vhosts per domain
- One-click SSL via Certbot
- Deploy static, PHP, Node.js, or Python sites
- Live server stats (CPU, RAM, disk)
- Role-based auth (superadmin, admin, client)

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite + React + TypeScript + shadcn/ui |
| Backend | Hono on Bun |
| Database | SQLite via libsql |
| ORM | Drizzle ORM |

## Getting started

### Prerequisites

- [Bun](https://bun.sh) >= 1.1
- A VPS running Ubuntu/Debian with nginx + certbot installed

### Install

```bash
git clone https://github.com/your-org/qanal
cd qanal
bun install
```

### Configure

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env
```

### Run (dev)

```bash
# Terminal 1 — API
cd apps/api && bun dev

# Terminal 2 — Web
cd apps/web && bun dev
```

Open http://localhost:5173 → register your admin account → add a server.

### Database

```bash
cd apps/api
bun run db:push
```

## Vision

See [IDEA.md](./IDEA.md) for the full product vision and roadmap.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
