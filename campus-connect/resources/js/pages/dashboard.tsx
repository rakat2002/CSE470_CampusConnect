import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Member 2: Student Collaboration Hub */}
                    <Link
                        href="/collaboration"
                        className="flex aspect-video flex-col justify-between rounded-xl border border-sidebar-border/70 p-6 transition hover:bg-neutral-100 dark:border-sidebar-border dark:hover:bg-neutral-900"
                    >
                        <Users className="size-8" />
                        <div>
                            <h2 className="text-lg font-semibold">Collaboration Hub</h2>
                            <p className="text-sm text-neutral-500">
                                Find teammates for assignments, projects, thesis and competitions.
                            </p>
                        </div>
                    </Link>

                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};