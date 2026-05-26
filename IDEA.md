# Qanal — The Universal Hosting Panel

> *Qanal* (قنال) — Arabic/Turkish for "channel". Every service you run is a channel to the world.

---

## The Problem

Hosting panels today force a choice:

| Panel | Problem |
|-------|---------|
| cPanel/Plesk | Expensive, bloated, locked to licenses |
| aapanel | Limited English support, plugin chaos |
| hPanel | Hostinger-only, no self-host |
| Webmin | Outdated UI, steep learning curve |
| Coolify/Dokku | Developer-only, no shared hosting |

**None of them serve everyone.** A beginner setting up their first WordPress site uses a completely different mental model than a sysadmin running 50 VPS nodes. Yet they need the same underlying power.

No panel bridges that gap. Qanal does.

---

## The Vision

**Qanal is the last hosting panel you'll ever need.**

One panel. Every server. Every skill level. Every service type.

- A teenager hosting their first blog should click three buttons.
- A sysadmin deploying microservices should have full terminal access and raw config control.
- Both should use the same panel.

---

## Core Philosophy

### 1. Progressive Disclosure
The UI shows what you need, hides what you don't — until you ask for more. Beginner mode shows big friendly buttons. Expert mode exposes raw nginx configs, cron editors, firewall rules. Same data, different lens.

### 2. Zero Lock-in
All config is standard. Nginx stays nginx. MySQL stays MySQL. No proprietary formats. Walk away and your server still works.

### 3. Everything Is a Service
A website, a radio stream, an AI inference endpoint, a game server — all are "services" with the same lifecycle: deploy, monitor, scale, destroy. Templates define what each service needs.

### 4. GitHub-Native
Connect a repo, pick a branch, deploy. Auto-deploy on push. Preview deployments on PRs. Not bolted on — built in from day one.

### 5. Multi-Tenant by Default
One Qanal install can serve one person or a hosting company with thousands of clients. Roles: `superadmin → admin → reseller → client → user`.

---

## What Qanal Supports

### Hosting Types
- **Shared Hosting** — multiple sites on one server, isolated with user namespaces
- **VPS Full Control** — raw server management, one tenant per install
- **Reseller Hosting** — allocate resources to sub-accounts
- **Cloud/Multi-Node** (future) — manage a fleet from one panel

### Service Types
- **Static Sites** — HTML/CSS/JS, CDN-ready
- **PHP Applications** — WordPress, Laravel, Drupal, custom
- **Node.js / Python / Ruby / Go** — any runtime via systemd services
- **Databases** — MySQL, PostgreSQL, MongoDB, Redis
- **Mail Server** — SMTP/IMAP with spam filtering (Postfix + Dovecot)
- **DNS Management** — full zone editor
- **SSL/TLS** — Let's Encrypt auto-renewal, custom certs
- **Radio Streaming** — Icecast/SHOUTcast management
- **AI Inference** — Ollama integration, model management
- **Game Servers** — template-based (Minecraft, etc.)
- **Docker Containers** — compose stacks, image management
- **Cron Jobs** — visual scheduler + raw crontab
- **Firewall** — UFW/iptables visual editor
- **Backups** — scheduled, incremental, S3/local/remote

### Developer Features
- GitHub/GitLab/Bitbucket integration
- Auto-deploy webhooks
- Preview environments per PR
- Environment variable management
- Build log streaming
- SSH key management
- API access (REST + WebSocket)

---

## Architecture Principles

### Stack
- **Frontend**: Next.js 14+ (App Router) + shadcn/ui + Tailwind CSS
- **Backend**: Node.js with Fastify (or Next.js API routes for MVP)
- **Agent**: Lightweight daemon running on managed servers (executes commands, streams logs)
- **Database**: PostgreSQL (primary) + Redis (sessions/queues)
- **Queue**: BullMQ for async jobs (deployments, backups, SSL renewal)
- **Auth**: Better Auth or Lucia — sessions, OAuth, 2FA

### Security Model
- All server commands go through the agent, never direct shell injection
- Role-based access control at every layer
- Audit log for every action
- 2FA required for destructive operations
- CSP headers, rate limiting, input sanitization throughout

### Extensibility
- Plugin/template system: drop a YAML file to add a new service type
- Webhook events for every lifecycle event
- REST API for automation
- CLI companion for power users

---

## Roadmap

### Phase 0: Foundation (MVP — THIS PHASE)
- [ ] Project scaffold (Next.js + shadcn)
- [ ] Auth (login, sessions, roles)
- [ ] Server connection (SSH key-based)
- [ ] Domain management + nginx vhost
- [ ] SSL via Let's Encrypt (Certbot)
- [ ] Static site deploy
- [ ] PHP site deploy (WordPress one-click)
- [ ] File manager (basic)
- [ ] Dashboard with server stats (CPU/RAM/disk)
- [ ] Logs viewer

### Phase 1: Developer Platform
- [ ] GitHub integration + auto-deploy
- [ ] Node.js / Python app hosting
- [ ] Database management UI
- [ ] Environment variables
- [ ] Preview environments

### Phase 2: Full Hosting Panel
- [ ] Mail server management
- [ ] DNS zone editor
- [ ] Reseller/multi-tenant accounts
- [ ] Backup system
- [ ] Cron manager

### Phase 3: Beyond Hosting
- [ ] Radio streaming service type
- [ ] AI inference (Ollama) service type
- [ ] Docker compose manager
- [ ] Multi-node fleet management
- [ ] Marketplace for templates

### Phase 4: Ecosystem
- [ ] Plugin API
- [ ] CLI tool
- [ ] Mobile app (read-only monitoring)
- [ ] Qanal Cloud (hosted version of the panel itself)

---

## Why Open Source?

Hosting infrastructure is too important to be locked behind licenses.

Every sysadmin who fixes a bug makes it better for everyone. Every template someone contributes expands what everyone can deploy. Open source means Qanal can't be killed by a company deciding to sunset it.

MIT licensed. Fork it. Self-host it. Build businesses on it.

---

## Name & Identity

**Qanal** — channel, conduit, pipeline. Every service you deploy is a channel: between your code and your users, between your ideas and the internet.

Simple. Pronounceable in any language. Memorable.

---

*Start simple. Stay powerful. Scale forever.*
