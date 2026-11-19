import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Tabs shared by all Resource and Help Hub pages
export function ResourceHubNav({ active, isAdmin }: { active: 'resources' | 'questions' | 'reports'; isAdmin: boolean }) {
    const tab = (key: string) =>
        `rounded-md px-4 py-2 text-sm font-medium ${
            active === key ? 'bg-blue-600 text-white' : 'border hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`;

    return (
        <div className="mb-6 flex flex-wrap gap-2">
            <Link href="/resources" className={tab('resources')}>Study Resources</Link>
            <Link href="/questions" className={tab('questions')}>Q&amp;A Help</Link>
            {isAdmin && (
                <Link href="/content-reports" className={tab('reports')}>Reports (Admin)</Link>
            )}
        </div>
    );
}

// Red message box for errors sent back with a key (report, answer)
export function PageError({ keys }: { keys: string[] }) {
    const errors = usePage().props.errors as Record<string, string>;
    const message = keys.map((key) => errors[key]).find(Boolean);

    if (!message) return null;

    return (
        <div className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-700">{message}</div>
    );
}

// "Report" link: asks for a reason, then sends the report
export function useReport() {
    const [reported, setReported] = useState<string[]>([]);

    function report(type: 'resource' | 'question' | 'reply', id: number) {
        const reason = window.prompt('Why are you reporting this? (at least 5 characters)');

        if (!reason || reason.trim().length < 5) return;

        router.post(
            '/content-reports',
            { type, id, reason: reason.trim() },
            {
                preserveScroll: true,
                onSuccess: () => setReported((previous) => [...previous, `${type}-${id}`]),
            },
        );
    }

    const isReported = (type: string, id: number) => reported.includes(`${type}-${id}`);

    return { report, isReported };
}
