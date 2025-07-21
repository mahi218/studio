import { IssueReportForm } from "@/components/forms/IssueReportForm";
import { getSession } from "@/lib/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportIssuePage() {
    const session = await getSession();

    if (!session) {
        return null; // Middleware will redirect
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Submit a New Report</CardTitle>
                    <CardDescription>
                        Please provide detailed information about the issue you are experiencing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <IssueReportForm user={session} />
                </CardContent>
            </Card>
        </div>
    );
}
