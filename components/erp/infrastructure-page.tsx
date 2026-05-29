'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileCode, Container, Settings, GitBranch, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DOCKER_COMPOSE = `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: stuffus_postgres
    environment:
      POSTGRES_USER: stuffus_admin
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: stuffus_erp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U stuffus_admin -d stuffus_erp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - stuffus_network

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: stuffus_api
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://stuffus_admin:\${POSTGRES_PASSWORD}@postgres:5432/stuffus_erp
      JWT_SECRET: \${JWT_SECRET}
      PORT: 3001
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3001:3001"
    networks:
      - stuffus_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: stuffus_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
    depends_on:
      - api
    ports:
      - "3000:3000"
    networks:
      - stuffus_network

  nginx:
    image: nginx:alpine
    container_name: stuffus_nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - api
    networks:
      - stuffus_network

volumes:
  postgres_data:

networks:
  stuffus_network:
    driver: bridge`

const NGINX_CONF = `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login_limit:10m rate=1r/s;

    # Upstream servers
    upstream frontend {
        server frontend:3000;
        keepalive 32;
    }

    upstream api {
        server api:3001;
        keepalive 32;
    }

    # HTTPS redirect
    server {
        listen 80;
        server_name stuffus.erp www.stuffus.erp;
        return 301 https://\$server_name\$request_uri;
    }

    # Main server block
    server {
        listen 443 ssl http2;
        server_name stuffus.erp www.stuffus.erp;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000" always;

        # API routes
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            
            proxy_pass http://api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login_limit burst=5 nodelay;
            
            proxy_pass http://api/auth/login;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\\n";
        }
    }
}`

const GITHUB_WORKFLOW = `name: STUFFUS.ERP CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run type check
        run: pnpm type-check

      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=

      - name: Build and push API image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}-api
          labels: \${{ steps.meta.outputs.labels }}

      - name: Build and push Frontend image
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}-frontend
          labels: \${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.STAGING_HOST }}
          username: \${{ secrets.STAGING_USER }}
          key: \${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/stuffus-erp
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.PRODUCTION_HOST }}
          username: \${{ secrets.PRODUCTION_USER }}
          key: \${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/stuffus-erp
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f

      - name: Notify deployment
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🚀 STUFFUS.ERP deployed to production!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*STUFFUS.ERP Production Deployment*\\nCommit: \`\${{ github.sha }}\`\\nBy: \${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}`

interface CodeBlockProps {
  code: string
  filename: string
}

function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-foreground">{filename}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-8 px-2 hover:bg-primary/10"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1 text-primary" />
              <span className="text-primary">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-foreground/90 whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  )
}

export function InfrastructurePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Infrastructure</h1>
        <p className="text-muted-foreground mt-1">Production-ready deployment configurations</p>
      </div>

      {/* Info Card */}
      <div className="glass-card p-4 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Deployment Stack</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This infrastructure uses Docker Compose for orchestration, Nginx as a reverse proxy with SSL termination,
            PostgreSQL for data persistence, and GitHub Actions for CI/CD automation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="docker" className="w-full">
        <TabsList className="glass-card p-1 h-auto flex-wrap">
          <TabsTrigger value="docker" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Container className="w-4 h-4" />
            Docker Compose
          </TabsTrigger>
          <TabsTrigger value="nginx" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Settings className="w-4 h-4" />
            Nginx Config
          </TabsTrigger>
          <TabsTrigger value="cicd" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <GitBranch className="w-4 h-4" />
            CI/CD Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docker" className="mt-4">
          <CodeBlock code={DOCKER_COMPOSE} filename="docker-compose.yml" />
        </TabsContent>

        <TabsContent value="nginx" className="mt-4">
          <CodeBlock code={NGINX_CONF} filename="nginx/nginx.conf" />
        </TabsContent>

        <TabsContent value="cicd" className="mt-4">
          <CodeBlock code={GITHUB_WORKFLOW} filename=".github/workflows/deploy.yml" />
        </TabsContent>
      </Tabs>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Container className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Containerization</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Multi-stage Docker builds for optimized images. Health checks and restart policies for reliability.
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Load Balancing</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Nginx reverse proxy with SSL/TLS, rate limiting, gzip compression, and security headers.
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground">Automation</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            GitHub Actions for linting, testing, building, and deploying to staging/production environments.
          </p>
        </div>
      </div>
    </div>
  )
}
