import { getInsightsSummary, getTransferFrequencyStats } from "@/lib/db";
import InsightsTabs from "@/components/InsightsTabs";

export default function InsightsPage() {
  const summary = getInsightsSummary();
  const transferStats = getTransferFrequencyStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Workforce Insights
        </h1>
        <p className="text-gray-500 mt-1">
          Co-service bonds, grade composition, and transfer frequency analysis across SLAS institutions
        </p>
      </div>
      <InsightsTabs summary={summary} transferStats={transferStats} />
    </div>
  );
}
