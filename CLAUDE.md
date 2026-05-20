# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for full project documentation — architecture, conventions, models, API surface, and known issues.

---

## Claude Code specifics

### Path alias resolution

`@/` aliases require `tsconfig-paths` at runtime. This is wired up via the `ts-node.require` field in `tsconfig.json` — no extra flags needed when running `npm run dev`.

### No test commands

There are no tests configured. Type safety is checked via `npm run typecheck`.

### Formatting

Prettier with 180-char line width. Run `npm run format` rather than manually adjusting line lengths.
