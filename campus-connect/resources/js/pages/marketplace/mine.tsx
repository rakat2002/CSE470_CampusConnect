import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Listing = {
    id: number;
    name: string;
    price: string;
    category: string;
    status: 'available' | 'sold';
};

type Props = { listings: Listing[] };

export default function MyListings({ listings }: Props) {
    function markSold(id: number) {
        router.patch(`/marketplace/${id}/sold`, {}, { preserveScroll: true });
    }

    function remove(id: number) {
        if (confirm('Delete this listing?')) {
            router.delete(`/marketplace/${id}`, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="My Listings" />
            <div className="p-4">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">My Listings</h1>
                    <Link href="/marketplace/create">
                        <Button>+ Sell an item</Button>
                    </Link>
                </div>

                {listings.length === 0 ? (
                    <p className="text-muted-foreground">You have not listed anything yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map((l) => (
                                    <tr key={l.id} className="border-t">
                                        <td className="p-3 font-medium">{l.name}</td>
                                        <td className="p-3">{l.category}</td>
                                        <td className="p-3">৳{l.price}</td>
                                        <td className="p-3">
                                            {l.status === 'sold' ? (
                                                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">Sold</span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">Available</span>
                                            )}
                                        </td>
                                        <td className="flex flex-wrap gap-2 p-3">
                                            {l.status === 'available' && (
                                                <>
                                                    <Link href={`/marketplace/${l.id}/edit`}>
                                                        <Button size="sm" variant="outline">Edit</Button>
                                                    </Link>
                                                    <Button size="sm" variant="outline" onClick={() => markSold(l.id)}>
                                                        Mark sold
                                                    </Button>
                                                </>
                                            )}
                                            <Button size="sm" variant="destructive" onClick={() => remove(l.id)}>
                                                Delete
                                            </Button>
                                        </td>
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

MyListings.layout = {
    breadcrumbs: [{ title: 'My Listings', href: '/marketplace/mine' }],
};