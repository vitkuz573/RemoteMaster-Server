# Multi-stage Dockerfile for Next.js production build

FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nextjs

# Copy standalone output for smaller prod image
# next.config.ts sets `output: 'standalone'`
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Runtime env
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

# Drop privileges
USER nextjs

# Start the Next.js server
CMD ["node", "server.js"]
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000
CMD ["npm", "run", "start"]
