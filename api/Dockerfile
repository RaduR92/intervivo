FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Prisma client generation is split into its own cached layer so it only
# reruns when the schema changes, not on every source edit.
FROM deps AS prisma-generate
COPY prisma/ ./prisma/
COPY prisma7.config.ts ./
RUN npx prisma generate

FROM prisma-generate AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules is copied whole (not a --omit=dev install) because
# `prisma migrate deploy` at deploy time needs the `prisma`/`dotenv` dev
# dependencies and prisma7.config.ts, not just the runtime deps.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./
COPY --from=build /app/package.json ./
# `prisma db seed` runs `tsx prisma/seed.ts`, which imports the *source*
# generated client (src/generated/prisma/*.ts) and src/users/constants —
# not the compiled dist/ output — so src/ has to be present in this image too.
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./

EXPOSE 3000
CMD ["node", "dist/main"]
