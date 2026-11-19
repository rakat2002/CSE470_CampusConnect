import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Donor = {
    blood_group: string;
    area: string;
    phone: string;
    is_available: boolean;
    last_donation_date: string | null;
    approval_status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
};

type Props = {
    donor: Donor | null;
    bloodGroups: string[];
    gapDays: number;
};

const selectClass =
    'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs';

export default function MyDonor({ donor, bloodGroups, gapDays }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        blood_group: donor?.blood_group ?? '',
        area: donor?.area ?? '',
        phone: donor?.phone ?? '',
        is_available: donor?.is_available ?? true,
        last_donation_date: donor?.last_donation_date ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/blood/my-donor', { preserveScroll: true });
    }

    // Is this donor still inside the donation gap?
    let gapMessage = '';
    if (data.last_donation_date) {
        const nextDate = new Date(data.last_donation_date);
        nextDate.setDate(nextDate.getDate() + gapDays);
        if (nextDate > new Date()) {
            gapMessage = `You are hidden from donor search until ${nextDate.toDateString()} (${gapDays}-day donation gap).`;
        }
    }

    return (
        <>
            <Head title="My Donor Profile" />
            <div className="max-w-xl p-4">
                <h1 className="mb-1 text-2xl font-semibold">
                    {donor ? 'My Donor Profile' : 'Register as a Blood Donor'}
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Your phone number is never shown in donor search.
                </p>
                                {donor?.approval_status === 'pending' && (
                    <p className="mb-5 rounded-md bg-amber-100 p-3 text-sm text-amber-900">⏳ Waiting for Admin approval. You will appear in donor search after approval.</p>
                )}
                {donor?.approval_status === 'approved' && (
                    <p className="mb-5 rounded-md bg-emerald-100 p-3 text-sm text-emerald-900">✅ Approved — you are a verified donor.</p>
                )}
                {donor?.approval_status === 'rejected' && (
                    <p className="mb-5 rounded-md bg-red-100 p-3 text-sm text-red-900">❌ Rejected: {donor.rejection_reason}. Update your details to resubmit.</p>
                )}

                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="blood_group">Blood group</Label>
                        <select
                            id="blood_group"
                            className={selectClass}
                            value={data.blood_group}
                            onChange={(e) => setData('blood_group', e.target.value)}
                        >
                            <option value="">Select...</option>
                            {bloodGroups.map((g) => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        <InputError message={errors.blood_group} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="area">Area</Label>
                        <Input
                            id="area"
                            value={data.area}
                            onChange={(e) => setData('area', e.target.value)}
                            placeholder="e.g. Mohakhali"
                        />
                        <InputError message={errors.area} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="01XXXXXXXXX"
                        />
                        <InputError message={errors.phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="is_available">Availability</Label>
                        <select
                            id="is_available"
                            className={selectClass}
                            value={data.is_available ? '1' : '0'}
                            onChange={(e) => setData('is_available', e.target.value === '1')}
                        >
                            <option value="1">Available</option>
                            <option value="0">Unavailable</option>
                        </select>
                        <InputError message={errors.is_available} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="last_donation_date">Last donation date (optional)</Label>
                        <Input
                            id="last_donation_date"
                            type="date"
                            value={data.last_donation_date ?? ''}
                            onChange={(e) => setData('last_donation_date', e.target.value)}
                        />
                        <InputError message={errors.last_donation_date} />
                    </div>

                    {gapMessage && (
                        <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-900">{gapMessage}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>
                            {donor ? 'Update' : 'Register as donor'}
                        </Button>
                        {recentlySuccessful && <span className="text-sm text-green-600">Saved ✓</span>}
                    </div>
                </form>
            </div>
        </>
    );
}

MyDonor.layout = {
    breadcrumbs: [{ title: 'My Donor Profile', href: '/blood/my-donor' }],
};