import { getAllReports } from "@/lib/actions";
import { ReportsTable } from "@/components/dashboard/ReportsTable";

export default async function DashboardPage() {
    const reports = await getAllReports();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold font-headline mb-2">Manager Dashboard</h1>
            <p className="text-muted-foreground mb-6">
                View, manage, and reply to all employee-submitted reports.
            </p>
            <ReportsTable initialReports={reports} />
        </div>
    );
}
