# Stage 1: Build the application
FROM node:22-bookworm-slim AS builder

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy only lockfiles first for better caching
COPY package.json yarn.lock ./

# Use corepack-managed Yarn and strict installs
RUN corepack enable && yarn --version && \
    yarn install --immutable

# Accept Firebase config as a build argument
ARG NEXT_PUBLIC_FIREBASE_CONFIG
ENV NEXT_PUBLIC_FIREBASE_CONFIG=$NEXT_PUBLIC_FIREBASE_CONFIG

# Now bring in the rest of the source
COPY . .

# Build Next.js app
RUN yarn build && yarn cache clean

# Stage 2: Runtime image
FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

# Copy only what we actually need at runtime
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Install only production dependencies
RUN corepack enable && \
    yarn install --immutable --mode=skip-builds --production=true && \
    yarn cache clean

EXPOSE 3000
CMD ["yarn", "start"]
