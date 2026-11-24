import { router } from '@inertiajs/react';
import { useState } from 'react';

type Stop = { id: number; stop_name: string; stop_order: number; arrival_time: string };
type Route = { id: number; route_name: string; day_type: string; direction: string; stops: Stop[] };

export default function Index({ routes, filters }: { routes: Route[]; filters: { search?: string } }) {
  const [search, setSearch] = useState(filters.search ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/transport', { search }, { preserveState: true });
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">University Bus Routes</h1>

      <form onSubmit={submit} className="mb-6 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search route or stop"
          className="flex-1 rounded border p-2"
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
      </form>

      {routes.length === 0 && <p>No routes found.</p>}

      {routes.map((route) => (
        <div key={route.id} className="mb-4 rounded border p-4">
          <h2 className="font-semibold">{route.route_name}</h2>
          <p className="text-sm text-gray-500">{route.day_type} · {route.direction}</p>
          <ul className="mt-2">
            {route.stops.map((s) => (
              <li key={s.id}>{s.arrival_time.slice(0, 5)} - {s.stop_name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}