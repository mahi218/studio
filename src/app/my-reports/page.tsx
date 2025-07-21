import { getMyReports } from "@/lib/actions";
import { Report } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Tag, ShieldCheck, MessageSquare } from "lucide-react";
import { format } from 'date-fns';

function getStatusVariant(status: Report['status']) {
    switch (status) {
        case 'Submitted': return 'secondary';
        case 'In Progress': return 'default';
        case 'Resolved': return 'outline';
        case 'Closed': return 'destructive';
        default: return 'default';
    }
}

export default async function MyReportsPage() {
    const reports = await getMyReports();

    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline flex items-center gap-2">
                        <FileText className="w-8 h-8"/> My Submitted Reports
                    </CardTitle>
                    <CardDescription>
                        Here is a list of all the issues you have reported.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reports.length > 0 ? (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead><div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Date</div></TableHead>
                                        <TableHead><div className="flex items-center gap-1"><Tag className="w-4 h-4" /> Department</div></TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead><div className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Status</div></TableHead>
                                        <TableHead><div className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Manager Reply</div></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium whitespace-nowrap">{format(new Date(report.submittedAt), 'PP')}</TableCell>
                                            <TableCell>{report.department}</TableCell>
                                            <TableCell className="max-w-sm truncate">{report.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground italic">{report.reply || "No reply yet."}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg">You haven&apos;t submitted any reports yet.</p>
                            <p>When you do, they will appear here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
