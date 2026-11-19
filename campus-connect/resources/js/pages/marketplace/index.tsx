import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ListingCard = {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    condition: string;
    seller: string;
    department: string;
    is_mine: boolean;
    posted: string;
};

type Props = {
    listings: ListingCard[];
    filters: { search?: string; category?: string; min_price?: string; max_price?: string };
    categories: string[];
};

export default function MarketplaceIndex({ listings, filters, categories }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [category, setCategory] = useState(filters.category ?? '');
    const [minPrice, setMinPrice] = useState(filters.min_price ?? '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price ?? '');

    function submit(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/marketplace',
            { search, category, min_price: minPrice, max_price: maxPrice },
            { preserveState: true },
        );
    }

    function clear() {
        setSearch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        router.get('/marketplace');
    }

    return (
        <>
            <Head title="Campus Marketplace" />
            <div className="p-4">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Campus Marketplace</h1>
                        <p className="text-sm text-muted-foreground">Buy and sell items on campus. Pay in person — no online payment.</p>
                    </div>
                    <Link href="/marketplace/create">
                        <Button>+ Sell an item</Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-3">
                    <Input className="w-56" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <Input className="w-28" type="number" placeholder="Min ৳" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <Input className="w-28" type="number" placeholder="Max ৳" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    <Button type="submit">Search</Button>
                    <Button type="button" variant="outline" onClick={clear}>Clear</Button>
                </form>

                {listings.length === 0 ? (
                    <p className="text-muted-foreground">No items found.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((l) => (
                            <div key={l.id} className="flex flex-col rounded-xl border p-4 shadow-sm">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <h2 className="text-lg font-semibold">{l.name}</h2>
                                    <span className="whitespace-nowrap text-lg font-bold text-emerald-600">৳{l.price}</span>
                                </div>
                                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full bg-muted px-2 py-1">{l.category}</span>
                                    <span className="rounded-full bg-muted px-2 py-1">{l.condition}</span>
                                    {l.is_mine && <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">Your listing</span>}
                                </div>
                                <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">{l.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    Seller: <span className="font-medium text-foreground">{l.seller}</span> ({l.department}) · {l.posted}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

MarketplaceIndex.layout = {
    breadcrumbs: [{ title: 'Marketplace', href: '/marketplace' }],
};