# Use Node.js LTS alpine as the base image
FROM node:20-alpine AS base

# Install pnpm using corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Stage 1: Build the backend application and its workspace dependencies
FROM base AS builder

# Copy root monorepo config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy shared package dependencies
COPY packages/types ./packages/types

# Copy the backend project source
COPY project/backend ./project/backend

# Install dependencies (utilizing pnpm cache mounts to speed up builds)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the backend application using Nest CLI
RUN pnpm --filter backend run build

# Stage 2: Final runner image (minimizes final image size)
FROM base AS runner

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/types /app/packages/types
COPY --from=builder /app/project/backend/dist /app/project/backend/dist
COPY --from=builder /app/project/backend/package.json /app/project/backend/package.json

WORKDIR /app/project/backend

# Expose backend port
EXPOSE 3000

# Start NestJS backend
CMD ["node", "dist/main"]
