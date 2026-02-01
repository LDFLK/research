import Link from 'next/link';
import { getAuditRuns } from '@/lib/data';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const runs = await getAuditRuns();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Audit Runs
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {runs.length} run{runs.length !== 1 ? 's' : ''} recorded
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No audit runs yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Run the audit engine to generate results.
          </p>
          <pre className="mt-4 text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded inline-block text-left">
            cd audit-engine && python main.py run
          </pre>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Audit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Run ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Datasets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {runs.map((run) => {
                const allPassed = run.summary.datasets_failed === 0;
                return (
                  <tr
                    key={run.run_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/runs/${run.run_id}`}
                        className="block hover:bg-gray-100 dark:hover:bg-gray-600 -m-2 p-2 rounded transition-colors"
                      >
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {run.config?.name || 'Audit Run'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {run.config?.platform || 'Unknown Platform'}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/runs/${run.run_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                      >
                        {run.run_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(run.started_at), 'PPpp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {run.summary.datasets_passed}
                      </span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {run.summary.datasets_total}
                      </span>
                      <span className="text-gray-400 ml-1">passed</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        {run.summary.successful}
                      </span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {run.summary.total_actions}
                      </span>
                      {run.summary.failed > 0 && (
                        <span className="text-red-500 ml-2">
                          ({run.summary.failed} failed)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          allPassed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {allPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
