import { Head, Link, router } from '@inertiajs/react';
import { ResourceHubNav } from '@/components/resource-hub-nav';
import { Button } from '@/components/ui/button';

interface Report {
    id: number;
    reason: string;
    reported_by: string | null;
    created_at: string;
    type: 'resource' | 'question' | 'reply';
    target_exists: boolean;
    target_hidden: boolean;
    target_text: string;
    target_link: string | null;
}

interface Props {
    reports: Report[];
}

const typeLabel = { resource: 'Resource', question: 'Question', reply: 'Reply' };

export default function Reports({ reports }: Props) {
    function hide(id: number) {
        router.patch(`/content-reports/${id}/hide`, {}, { preserveScroll: true });
    }

    function dismiss(id: number) {
        router.patch(`/content-reports/${id}/dismiss`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Reported Content" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Academic Resource and Help Hub</h1>
                <ResourceHubNav active="reports" isAdmin={true} />

                <h2 className="mb-4 text-xl font-semibold">Pending Reports ({reports.length})</h2>

                {reports.length === 0 ? (
                    <p className="py-6 text-center text-gray-500">No pending reports.</p>
                ) : (
                    <div className="grid gap-3">
                        {reports.map((report) => (
                            <div key={report.id} className="rounded-lg border p-4">
                                <p className="text-sm text-gray-500">
                                    {typeLabel[report.type]} · reported by {report.reported_by ?? 'Unknown'} ·{' '}
                                    {new Date(report.created_at).toLocaleString()}
                                </p>

                                <p className="mt-1 font-medium">
                                    {report.target_link ? (
                                        <Link href={report.target_link} className="underline">
                                            {report.target_text}
                                        </Link>
                                    ) : (
                                        report.target_text
                                    )}
                                    {report.target_hidden && (
                                        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Already hidden</span>
                                    )}
                                </p>

                                <p className="mt-1 text-sm">
                                    <span className="font-medium">Reason:</span> {report.reason}
                                </p>

                                <div className="mt-3 flex gap-2">
                                    {report.target_exists && (
                                        <Button size="sm" variant="destructive" onClick={() => hide(report.id)}>
                                            Hide content
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => dismiss(report.id)}>
                                        Dismiss report
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Reports.layout = {
    breadcrumbs: [{ title: 'Reported Content', href: '/content-reports' }],
};
