<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- Use Node.js 24+ and npm. Run `npm run lint` and `npm run build` for application verification; there is no test suite or typecheck script.
- Run `npm run db:generate` after changing `prisma/schema.prisma`. Create development migrations with `npm run db:migrate -- --name <name>`; production uses the committed files in `prisma/migrations` through `npm run db:deploy`.
- Validate Compose changes with `docker compose --env-file .env.example config --quiet`. Start the complete production-like stack locally with `docker compose --env-file .env.example up --build`.

## Runtime And Deployment

- The app is an App Router Next.js application in `app/`; `app/api/health/route.ts` must continue to check both the app and PostgreSQL because Docker and Coolify health checks rely on it.
- Docker Compose is the production deployment unit for Coolify: `app` and PostgreSQL `db` deploy together. Keep database access internal through the `db` hostname; do not publish a database port.
- `scripts/start.sh` runs `prisma migrate deploy` before Next.js starts. Do not remove the `prisma` directory or Prisma CLI from the runtime image.
- PostgreSQL data lives in the `postgres_data` named volume. Redeploys preserve it, but it is not a backup.
- Compose constructs `DATABASE_URL` from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`; use an alphanumeric password unless the URL encoding is updated too. `DATABASE_URL` in `.env` is only for host-run commands.
