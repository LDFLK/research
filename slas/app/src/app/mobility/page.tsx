import { getMobilityStats } from "@/lib/db";
import MobilityDashboard from "@/components/MobilityDashboard";

export default function MobilityPage() {
  const stats = getMobilityStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Transfer Mobility Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Geographic movement analysis of SLAS officer transfers across Sri Lanka
        </p>
      </div>
      <MobilityDashboard stats={stats} />
    </div>
  );
}
