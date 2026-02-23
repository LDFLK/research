"use client"
import { useEffect, useState } from "react";
import { ActsTable } from "@/components/acts/ActsTable"
import { Dashboard } from "@/components/acts/Dashboard"
import { Act } from "@/lib/types"
import { ActsHeader } from "@/components/acts/ActsHeader"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
if (!apiUrl) {
    console.log("API URL is not defined");
}
console.log(apiUrl);

export default function ActsPage() {
    const [data, setData] = useState<Act[]>([]);

    useEffect(() => {
        fetch(`${apiUrl}/acts`)
            .then(res => res.json())
            .then(setData)
            .catch(console.error);
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

                <Dashboard data={data} />

                <div className="flex items-center justify-between space-y-2 mt-8">
                    <h2 className="text-3xl font-bold tracking-tight">All Acts</h2>
                </div>
                <ActsTable data={data} />
            </div>
        </div>
    )
}
