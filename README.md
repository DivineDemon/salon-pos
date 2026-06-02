# salon-pos

Point of sale for **Suraya Beauty Point Salon** — bilingual (EN/AR), OMR currency, multi-branch.

## Stack

- **Bun** — package manager and runtime scripts
- **Biome** — lint and format (replaces ESLint + Prettier)
- **Next.js** (App Router) + **Tailwind CSS** + **shadcn/ui**
- **next-intl** — English + Arabic with RTL (`dir="rtl"` on Arabic)
- **Drizzle ORM** + **Neon Postgres**

## Getting started

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Set `DATABASE_URL` to your [Neon](https://neon.tech) connection string and `SESSION_SECRET` to a random string.

3. Install and run ([Bun](https://bun.sh)):

   ```bash
   bun install
   bun run dev
   ```

4. Open [http://localhost:3000/en](http://localhost:3000/en) or [http://localhost:3000/ar](http://localhost:3000/ar) for RTL preview.

## Lint & format

[Biome](https://biomejs.dev) replaces ESLint and Prettier. TypeScript/JavaScript files and folders use **kebab-case** (`useFilenamingConvention`); Next.js reserved names (`page.tsx`, `layout.tsx`, `[locale]/`, etc.) are excluded via overrides.

```bash
bun run lint
bun run format
bun run typecheck
```

## Database

```bash
bun run db:generate   # generate migrations from schema
bun run db:push       # push schema to Neon (dev)
bun run db:migrate    # run migrations
```

Schema: [`src/lib/db/schema.ts`](src/lib/db/schema.ts)

## Deploy (Vercel + Neon)

Production: **https://salon-pos-opal.vercel.app**

Required Vercel environment variables: `DATABASE_URL`, `SESSION_SECRET`.

One-time setup against a fresh database:

```bash
bun run db:migrate
```

Create the owner admin account directly in the database or via a future admin UI — there is no bootstrap script in this repo.

```bash
bunx vercel deploy --prod
```

## Project structure

```
src/
├── app/[locale]/(employee)/   # Employee routes (sales, expenses)
├── app/[locale]/(admin)/      # Admin routes (CRUD, reports)
├── app/api/auth/              # login, logout
├── components/                # UI components
├── intl/                      # next-intl routing & navigation
└── lib/
    ├── currency.ts            # formatOMR / parseOMR
    ├── db/                    # Drizzle + Neon
    └── auth/                  # Session + credential helpers
messages/en.json, ar.json
```

## Locales

| Locale | URL prefix | Direction |
|--------|------------|-----------|
| English | `/en` | LTR |
| Arabic | `/ar` | RTL |
