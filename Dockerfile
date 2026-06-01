FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling and enable pnpm via corepack
RUN apk add --no-cache dumb-init
ENV PNPM_HOME="/root/.local/share/pnpm" PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy source and build
COPY . .
RUN pnpm build

EXPOSE 5000

# Run using the PORT environment variable (defaults to 5000 via docker-compose)
CMD ["dumb-init", "pnpm", "start"]
