import { ActsTable } from "@/components/acts/ActsTable"
import { Dashboard } from "@/components/acts/Dashboard"
import { Act } from "@/lib/types"
import actsData from "../../public/data/acts.json"

// In a real app, this might be fetched from an API
// For now we import the JSON directly as it's static
const data: Act[] = actsData as Act[]

export default function ActsPage() {
    return (
        <div className="hidden flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <h2 className="text-lg font-semibold">Sri Lankan Legislative Acts</h2>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>

                <Dashboard data={data} />

                <div className="flex items-center justify-between space-y-2 mt-8">
                    <h2 className="text-3xl font-bold tracking-tight">All Acts</h2>
                </div>
                <ActsTable data={data} />
            </div>
        </div>
    )
}
