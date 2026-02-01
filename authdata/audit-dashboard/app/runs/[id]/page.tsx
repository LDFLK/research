import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuditRun } from '@/lib/data';
import { format } from 'date-fns';
import ActionTimeline from '@/components/ActionTimeline';
import AuditReport from '@/components/AuditReport';
import PhaseInfo from '@/components/PhaseInfo';
import PhaseLegend from '@/components/PhaseLegend';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RunDetailPage({ params }: Props) {
  const { id } = await params;
  const run = await getAuditRun(id);

  if (!run) {
    notFound();
  }

  const { manifest, actions, report } = run;
  const allPassed = manifest.summary.datasets_failed === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block"
          >
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
              {manifest.config?.platform || 'Unknown Platform'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {manifest.config?.name || 'Audit Run'}
          </h1>
          {manifest.config?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {manifest.config.description}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-2">
            {manifest.run_id}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            allPassed
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {allPassed ? 'ALL PASSED' : 'SOME FAILED'}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Started</div>
          <div className="text-lg font-medium text-gray-900 dark:text-white">
            {format(new Date(manifest.started_at), 'PPpp')}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Datasets</div>
          <div className="text-lg font-medium">
            <span className="text-green-600 dark:text-green-400">
              {manifest.summary.datasets_passed}
            </span>
            <span className="text-gray-400"> / </span>
            <span className="text-gray-900 dark:text-white">
              {manifest.summary.datasets_total}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
              passed
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Actions</div>
          <div className="text-lg font-medium">
            <span className="text-green-600 dark:text-green-400">
              {manifest.summary.successful}
            </span>
            <span className="text-gray-400"> / </span>
            <span className="text-gray-900 dark:text-white">
              {manifest.summary.total_actions}
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Phases <span className="text-xs">(hover for details)</span>
          </div>
          <PhaseInfo phases={manifest.config.phases} />
        </div>
      </div>

      {/* Config */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Years:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {manifest.config.years.join(', ')}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">App URL:</span>
            <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
              {manifest.config.app_url || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Datasets:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {manifest.config.datasets.length} configured
            </span>
          </div>
        </div>
      </div>

      {/* Phase Legend */}
      <PhaseLegend />

      {/* Tabs for Report and Timeline */}
      <div className="space-y-6">
        {/* Report Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Audit Report
          </h2>
          <AuditReport report={report} />
        </div>

        {/* Action Timeline */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Action Timeline ({actions.length} actions)
          </h2>
          <ActionTimeline actions={actions} />
        </div>
      </div>
    </div>
  );
}
