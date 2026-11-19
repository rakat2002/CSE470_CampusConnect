import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Person = { id: number; name: string; student_id: string; department: string };

type PendingListing = {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    condition: string;
    created_at: string;
    user: Person;
};

type PendingDonor = {
    id: number;
    blood_group: string;
    area: string;
    phone: string;
    is_available: boolean;
    last_donation_date: string | null;
    user: Person;
};

type Props = {
    stats: { pendingListings: number; pendingDonors: number; liveListings: number; approvedDonors: number };
    listings: PendingListing[];
    donors: PendingDonor[];
};

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
    return (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${tone}`}>{value}</p>
        </div>
    );
}

export default function AdminDashboard({ stats, listings, donors }: Props) {
    function approve(url: string) {
        router.patch(url, {}, { preserveScroll: true });
    }

    function reject(url: string) {
        const reason = prompt('Reason for rejection (the student will see this):');
        if (reason && reason.trim()) {
            router.patch(url, { reason }, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Admin Panel" />
            <div className="space-y-8 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">🛡️ Admin Panel</h1>
                    <p className="text-sm text-muted-foreground">Review new marketplace listings and blood donor registrations.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Listings waiting" value={stats.pendingListings} tone="text-amber-600" />
                    <StatCard label="Donors waiting" value={stats.pendingDonors} tone="text-amber-600" />
                    <StatCard label="Live listings" value={stats.liveListings} tone="text-emerald-600" />
                    <StatCard label="Approved donors" value={stats.approvedDonors} tone="text-red-600" />
                </div>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">🛒 Pending marketplace listings</h2>
                    {listings.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Nothing to review 🎉</p>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {listings.map((l) => (
                                <div key={l.id} className="rounded-2xl border bg-card p-4 shadow-sm">
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                        <h3 className="font-semibold">{l.name}</h3>
                                        <span className="font-bold text-emerald-600">৳{l.price}</span>
                                    </div>
                                    <p className="mb-2 text-xs text-muted-foreground">
                                        {l.category} · {l.condition}
                                    </p>
                                    <p className="mb-3 text-sm">{l.description}</p>
                                    <p className="mb-4 text-xs text-muted-foreground">
                                        By {l.user.name} ({l.user.student_id}, {l.user.department})
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => approve(`/admin/listings/${l.id}/approve`)}>Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => reject(`/admin/listings/${l.id}/reject`)}>Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="mb-3 text-lg font-semibold">🩸 Pending blood donors</h2>
                    {donors.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Nothing to review 🎉</p>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {donors.map((d) => (
                                <div key={d.id} className="flex items-start gap-4 rounded-2xl border bg-card p-4 shadow-sm">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
                                        {d.blood_group}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{d.user.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {d.user.student_id} · {d.user.department}
                                        </p>
                                        <p className="mt-1 text-sm">📍 {d.area} · 📞 {d.phone}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {d.is_available ? 'Available' : 'Unavailable'} · Last donation: {d.last_donation_date ?? 'not given'}
                                        </p>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" onClick={() => approve(`/admin/donors/${d.id}/approve`)}>Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => reject(`/admin/donors/${d.id}/reject`)}>Reject</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Admin Panel', href: '/admin' }],
};