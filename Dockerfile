FROM node:20-alpine AS base

# API build
FROM base AS api-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY apps/api apps/api
COPY packages packages
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @learnverse/api build

# Web build
FROM base AS web-build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json turbo.json ./
COPY apps/web apps/web
COPY packages packages
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm --filter @learnverse/web build

# API runner
FROM base AS api
WORKDIR /app
COPY --from=api-build /app/apps/api/dist ./dist
COPY --from=api-build /app/apps/api/package.json ./
COPY --from=api-build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]

# Web runner
FROM base AS web
WORKDIR /app
COPY --from=web-build /app/apps/web/.next ./.next
COPY --from=web-build /app/apps/web/public ./public
COPY --from=web-build /app/apps/web/package.json ./
COPY --from=web-build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npx", "next", "start"]
