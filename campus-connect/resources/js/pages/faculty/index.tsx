import { useState } from 'react';
import { Head, router } from '@inertiajs/react';

interface Faculty {
    id: number;
    name: string;
    department: string;
    designation: string | null;
    email: string | null;
    office_location: string | null;
    consultation_days: string | null;
    consultation_hours: string | null;
}

interface Props {
    faculty: Faculty[];
    filters: {
        search: string | null;
    };
}

export default function FacultyIndex({ faculty, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(value: string) {
        setSearch(value);
        router.get('/faculty', { search: value }, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Faculty Directory" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">
                    Faculty Directory
                </h1>

                <p className="text-gray-600 mb-6">
                    Find faculty members and their consultation hours.
                </p>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or department..."
                    className="w-full max-w-md border rounded-lg px-4 py-2 mb-6"
                />

                {faculty.length === 0 ? (
                    <p className="text-gray-500">
                        No faculty members found.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {faculty.map((member) => (
                            <div
                                key={member.id}
                                className="border rounded-xl p-5 shadow-sm"
                            >
                                <h2 className="text-lg font-semibold">
                                    {member.name}
                                </h2>

                                <p className="text-sm text-gray-600">
                                    {member.designation ?? 'Faculty Member'}
                                    {' · '}
                                    {member.department}
                                </p>

                                {member.email && (
                                    <p className="mt-3 text-sm">
                                        Email: {member.email}
                                    </p>
                                )}

                                {member.office_location && (
                                    <p className="text-sm">
                                        Office: {member.office_location}
                                    </p>
                                )}

                                {member.consultation_days && (
                                    <p className="text-sm mt-2">
                                        Consultation days: {member.consultation_days}
                                    </p>
                                )}

                                {member.consultation_hours && (
                                    <p className="text-sm">
                                        Consultation hours: {member.consultation_hours}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}