import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium">System Online</span>
                </div>
            </div>

            {/* Analytics Overview */}
            <AnalyticsOverview />

            {/* Auth Info */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Auth Status</h3>
                    <p className="text-muted-foreground">Signed in to the station control panel.</p>
                </div>

                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">File System</h3>
                    <p className="text-muted-foreground">PHP File write access enabled for /public/data</p>
                </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
                <strong>Note:</strong> Changes made here update the JSON files on your HostGator server directly via PHP.
            </div>
        </div>
    );
}
