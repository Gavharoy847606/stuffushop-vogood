"use client";

import { Settings } from "lucide-react";

export function InfrastructurePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Infrastructure
        </h1>
        <p className="text-muted-foreground mt-1">
          Summary of deployment architecture (sensitive details hidden)
        </p>
      </div>

      <div className="glass-card p-4 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Deployment Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This project uses containerized backend services behind a reverse
            proxy, a managed PostgreSQL instance for persistence, and CI/CD
            pipelines for automated deployment. Sensitive configuration values
            (DB credentials, webhooks, secrets) are intentionally not displayed
            in the UI.
          </p>
        </div>
      </div>
    </div>
  );
}
