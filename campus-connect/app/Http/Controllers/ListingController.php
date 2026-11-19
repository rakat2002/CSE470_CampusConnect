<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ListingController extends Controller
{
    // Browse + search. Sold listings are hidden from search.
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category', 'min_price', 'max_price']);

        $listings = Listing::query()
            ->where('status', 'available')
            ->with('user:id,name,department')
            ->when($filters['search'] ?? null, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($filters['category'] ?? null, fn ($q, $c) => $q->where('category', $c))
            ->when($filters['min_price'] ?? null, fn ($q, $min) => $q->where('price', '>=', $min))
            ->when($filters['max_price'] ?? null, fn ($q, $max) => $q->where('price', '<=', $max))
            ->latest()
            ->get()
            ->map(fn (Listing $l) => [
                'id' => $l->id,
                'name' => $l->name,
                'description' => $l->description,
                'price' => $l->price,
                'category' => $l->category,
                'condition' => $l->condition,
                'seller' => $l->user->name,          // public info only
                'department' => $l->user->department, // (no phone / email)
                'is_mine' => $l->user()->is($request->user()),
                'posted' => $l->created_at->diffForHumans(),
            ]);

        return Inertia::render('marketplace/index', [
            'listings' => $listings,
            'filters' => $filters,
            'categories' => Listing::CATEGORIES,
        ]);
    }

    // The logged-in student's own listings (including sold ones = history)
    public function mine(Request $request): Response
    {
        return Inertia::render('marketplace/mine', [
            'listings' => $request->user()->listings()->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('marketplace/form', [
            'listing' => null,
            'categories' => Listing::CATEGORIES,
            'conditions' => Listing::CONDITIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->user()->listings()->create($this->validatedData($request)); // new listing = available

        return redirect()->route('listings.mine');
    }

    public function edit(Request $request, Listing $listing): Response
    {
        $this->ensureOwner($request, $listing);

        return Inertia::render('marketplace/form', [
            'listing' => $listing,
            'categories' => Listing::CATEGORIES,
            'conditions' => Listing::CONDITIONS,
        ]);
    }

    public function update(Request $request, Listing $listing): RedirectResponse
    {
        $this->ensureOwner($request, $listing);
        abort_if($listing->status === 'sold', 403, 'Sold listings cannot be edited.');

        $listing->update($this->validatedData($request));

        return redirect()->route('listings.mine');
    }

    public function destroy(Request $request, Listing $listing): RedirectResponse
    {
        $this->ensureOwner($request, $listing);
        $listing->delete();

        return redirect()->route('listings.mine');
    }

    public function markSold(Request $request, Listing $listing): RedirectResponse
    {
        $this->ensureOwner($request, $listing);
        $listing->update(['status' => 'sold']);

        return redirect()->route('listings.mine');
    }

    // Validation rules shared by create and edit
    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'category' => ['required', Rule::in(Listing::CATEGORIES)],
            'condition' => ['required', Rule::in(Listing::CONDITIONS)],
        ]);
    }

    // Rule: students can only edit/delete their own listings
    private function ensureOwner(Request $request, Listing $listing): void
    {
        abort_unless($listing->user()->is($request->user()), 403, 'You can only manage your own listings.');
    }
}