import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DonorRow = {
    id: number;
    name: string;
    department: string;
    blood_group: string;
    area: string;
    last_donation_date: string | null;
};

type Props = {
    donors: DonorRow[];
    filters: { blood_group?: string; area?: string };
    bloodGroups: string[];
};

export default function Donors({ donors, filters, bloodGroups }: Props) {
    const [bloodGroup, setBloodGroup] = useState(filters.blood_group ?? '');
    const [area, setArea] = useState(filters.area ?? '');

    function search(e: FormEvent) {
        e.preventDefault();
        router.get('/blood/donors', { blood_group: bloodGroup, area }, { preserveState: true });
    }

    function clear() {
        setBloodGroup('');
        setArea('');
        router.get('/blood/donors');
    }

    return (
        <>
            <Head title="Find Blood Donors" />
            <div className="p-4">
                <h1 className="mb-1 text-2xl font-semibold">Find Blood Donors</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Only available donors outside the donation gap are shown. Phone numbers are hidden.
                </p>

                <form onSubmit={search} className="mb-6 flex flex-wrap items-end gap-3">
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                    >
                        <option value="">All blood groups</option>
                        {bloodGroups.map((g) => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <Input
                        className="w-56"
                        placeholder="Area (e.g. Mohakhali)"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                    <Button type="button" variant="outline" onClick={clear}>Clear</Button>
                </form>

                {donors.length === 0 ? (
                    <p className="text-muted-foreground">No donors found.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">Blood group</th>
                                    <th className="p-3">Area</th>
                                    <th className="p-3">Last donation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donors.map((d) => (
                                    <tr key={d.id} className="border-t">
                                        <td className="p-3">{d.name}</td>
                                        <td className="p-3">{d.department}</td>
                                        <td className="p-3 font-semibold text-red-600">{d.blood_group}</td>
                                        <td className="p-3">{d.area}</td>
                                        <td className="p-3">{d.last_donation_date ?? 'Never / not given'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

Donors.layout = {
    breadcrumbs: [{ title: 'Find Donors', href: '/blood/donors' }],
};