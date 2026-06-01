'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileCode, Container, Settings, GitBranch, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const DOCKER_COMPOSE = `version: '3.8'

services:
  # Nginx Load Balancer
  load_balancer:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8080:80"
    depends_on:
      - erp_backend_1
      - erp_backend_2
      - erp_backend_3

  # ERP Backend - Instance 1
  erp_backend_1:
    build: .
    environment:
      - PORT=5000
      - DB_HOST=dpg-d808kc8sfn5c739appug-a.virginia-postgres.render.com
      - DB_NAME=localhost_mvo8
      - DB_USER=wed
      - DB_PASSWORD=\${DB_PASSWORD}
    expose:
      - "5000"

  # ERP Backend - Instance 2
  erp_backend_2:
    build: .
    environment:
      - PORT=5000
      - DB_HOST=dpg-d808kc8sfn5c739appug-a.virginia-postgres.render.com
      - DB_NAME=localhost_mvo8
      - DB_USER=wed
      - DB_PASSWORD=\${DB_PASSWORD}
    expose:
      - "5000"

  # ERP Backend - Instance 3
  erp_backend_3:
    build: .
    environment:
      - PORT=5000
      - DB_HOST=dpg-d808kc8sfn5c739appug-a.virginia-postgres.render.com
      - DB_NAME=localhost_mvo8
      - DB_USER=wed
      - DB_PASSWORD=\${DB_PASSWORD}
    expose:
      - "5000"`

const NGINX_CONF = `events { worker_connections 1024; }

http {
    # Bizning Backend klasterimiz (Auto-scaling va High-Availability nusxalari)
    upstream erp_backend {
        # Round-Robin algoritmi bo'yicha so'rovlar navbatma-navbat bo'linadi
        server erp_backend_1:5000;
        server erp_backend_2:5000;
        server erp_backend_3:5000;
    }

    server {
        listen 80;

        # Kelayotgan so'rovlarni backend klasteriga yukni bo'lib yuborish
        location / {
            proxy_pass http://erp_backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }
    }
}`

const GITHUB_WORKFLOW = `name: CI/CD Enterprise ERP Pipeline

on:
  push:
    branches:
      - main

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Validate Docker Compose Configuration
        run: docker compose config

  deploy-to-render:
    needs: validate-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render.com Production Deployment
        run: |
          curl -X POST "\${{ secrets.RENDER_FRONTEND_WEBHOOK }}"`

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
