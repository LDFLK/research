import { promises as fs } from 'fs';
import path from 'path';
import { AuditManifest, AuditReport, Action, AuditRun } from './types';

const AUDIT_RESULTS_DIR = path.join(process.cwd(), '..', 'audit-engine', 'audit-results');

export async function getAuditRuns(): Promise<AuditManifest[]> {
  try {
    const dirs = await fs.readdir(AUDIT_RESULTS_DIR);
    const runs: AuditManifest[] = [];

    for (const dir of dirs) {
      const manifestPath = path.join(AUDIT_RESULTS_DIR, dir, 'manifest.json');
      try {
        const content = await fs.readFile(manifestPath, 'utf-8');
        runs.push(JSON.parse(content));
      } catch {
        // Skip directories without valid manifest
      }
    }

    // Sort by started_at descending
    runs.sort((a, b) =>
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    return runs;
  } catch {
    return [];
  }
}

export async function getAuditRun(runId: string): Promise<AuditRun | null> {
  const runDir = path.join(AUDIT_RESULTS_DIR, runId);

  try {
    const [manifestContent, actionsContent, reportContent] = await Promise.all([
      fs.readFile(path.join(runDir, 'manifest.json'), 'utf-8'),
      fs.readFile(path.join(runDir, 'actions.json'), 'utf-8'),
      fs.readFile(path.join(runDir, 'report.json'), 'utf-8'),
    ]);

    return {
      id: runId,
      manifest: JSON.parse(manifestContent),
      actions: JSON.parse(actionsContent),
      report: JSON.parse(reportContent),
    };
  } catch {
    return null;
  }
}

export async function getActions(runId: string): Promise<Action[]> {
  const actionsPath = path.join(AUDIT_RESULTS_DIR, runId, 'actions.json');

  try {
    const content = await fs.readFile(actionsPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function getReport(runId: string): Promise<AuditReport | null> {
  const reportPath = path.join(AUDIT_RESULTS_DIR, runId, 'report.json');

  try {
    const content = await fs.readFile(reportPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
