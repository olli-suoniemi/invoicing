# Stage 1: Build the application
FROM node:22-bookworm-slim AS builder

ENV NEXT_TELEMETRY_DISABLED=1 \
    ENV=production

WORKDIR /app

# Accept build args from GitHub Actions. Needed for the CI/CD
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_USE_EMULATOR

# Expose them as env vars for the build (so next build can read them)
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY \
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID \
    NEXT_PUBLIC_USE_EMULATOR=$NEXT_PUBLIC_USE_EMULATOR

COPY package.json yarn.lock ./
RUN corepack enable && yarn --version && yarn install

COPY . .
RUN yarn build && yarn cache clean


# Stage 2: Runtime image
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOST=0.0.0.0 \
    ENV=production

WORKDIR /app

# 1) Copy the standalone output as the app root
#    This brings in:
#      - server.js
#      - .next/
#      - node_modules/
#      - everything needed to run the server
COPY --from=builder /app/.next/standalone ./

# 2) Static assets for _next/static/*
COPY --from=builder /app/.next/static ./.next/static

# 3) Public assets
COPY --from=builder /app/public ./public

EXPOSE 3000

# Run the standalone Next.js server directly
CMD ["node", "server.js"]
