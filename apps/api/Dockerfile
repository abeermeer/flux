FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/prisma ./apps/api/prisma

RUN npm install --include=dev
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

COPY apps/api/src ./apps/api/src
RUN npx tsc -p apps/api/tsconfig.json

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/index.js"]
