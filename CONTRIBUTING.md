# Contributing to Qanal

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run `bun run lint` — must pass
5. Commit with a clear message (see below)
6. Open a PR against `main`

## Commit message format

```
type(scope): short description

Types: feat, fix, chore, docs, refactor, test
Scopes: api, web, db, auth, ssh, domains, sites
```

Examples:
- `feat(api): add certbot ssl endpoint`
- `fix(web): correct domain delete not updating list`
- `chore: update dependencies`

## Code style

- TypeScript strict mode — no `any`
- No comments unless the WHY is non-obvious
- One feature or fix per PR

## Reporting bugs

Open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behavior
- OS / Bun version
