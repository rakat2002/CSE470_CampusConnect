import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Listing = {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    condition: string;
};

type Props = {
    listing: Listing | null; // null = creating a new one
    categories: string[];
    conditions: string[];
};

const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs';

export default function ListingForm({ listing, categories, conditions }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: listing?.name ?? '',
        description: listing?.description ?? '',
        price: listing?.price ?? '',
        category: listing?.category ?? '',
        condition: listing?.condition ?? '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (listing) {
            put(`/marketplace/${listing.id}`);
        } else {
            post('/marketplace');
        }
    }

    return (
        <>
            <Head title={listing ? 'Edit listing' : 'Sell an item'} />
            <div className="max-w-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">{listing ? 'Edit listing' : 'Sell an item'}</h1>

                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Item name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Scientific calculator" />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            rows={4}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Condition details, why you're selling, etc."
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (৳)</Label>
                        <Input id="price" type="number" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} />
                        <InputError message={errors.price} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <select id="category" className={selectClass} value={data.category} onChange={(e) => setData('category', e.target.value)}>
                            <option value="">Select...</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <InputError message={errors.category} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="condition">Condition</Label>
                        <select id="condition" className={selectClass} value={data.condition} onChange={(e) => setData('condition', e.target.value)}>
                            <option value="">Select...</option>
                            {conditions.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <InputError message={errors.condition} />
                    </div>

                    <Button type="submit" disabled={processing} className="w-fit">
                        {listing ? 'Save changes' : 'Post listing'}
                    </Button>
                </form>
            </div>
        </>
    );
}

ListingForm.layout = {
    breadcrumbs: [{ title: 'Sell / Edit item', href: '/marketplace/mine' }],
};