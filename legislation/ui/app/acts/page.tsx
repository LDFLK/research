"use client"
import { useEffect, useState } from "react";
import { ActsTable } from "@/components/acts/ActsTable"
import { Dashboard } from "@/components/acts/Dashboard"
import { Act } from "@/lib/types"
import { ActsHeader } from "@/components/acts/ActsHeader"
import { useConfig } from "@/provider/configProvider"

export default function ActsPage() {
    const apiUrl = useConfig().apiUrl;
    const [data, setData] = useState<Act[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${apiUrl}/acts`)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
                return res.json();
            })
            .then(setData)
            .catch((err) => setError(err.message ?? "Something went wrong"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="hidden flex-col md:flex">
            <div className="border-b">
                <ActsHeader />
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
                            <p className="text-sm">Loading acts...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <p className="text-lg font-semibold text-destructive">Failed to load data</p>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <Dashboard data={data} />

                        <div className="flex items-center justify-between space-y-2 mt-8">
                            <h2 className="text-3xl font-bold tracking-tight">All Acts</h2>
                        </div>
                        <ActsTable data={data} />
                    </>
                )}
            </div>
        </div>
    )
}