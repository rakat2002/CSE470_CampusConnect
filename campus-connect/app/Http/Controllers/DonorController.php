<?php

namespace App\Http\Controllers;

use App\Models\Donor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DonorController extends Controller
{
    // Search donors: only eligible donors, and phone numbers are never sent
    public function index(Request $request): Response
    {
        $filters = $request->only(['blood_group', 'area']);

        $donors = Donor::query()
            ->eligible()
            ->with('user:id,name,department')
            ->when($filters['blood_group'] ?? null, fn ($q, $group) => $q->where('blood_group', $group))
            ->when($filters['area'] ?? null, fn ($q, $area) => $q->where('area', 'like', "%{$area}%"))
            ->latest()
            ->get()
            ->map(fn (Donor $donor) => [
                'id' => $donor->id,
                'name' => $donor->user->name,
                'department' => $donor->user->department,
                'blood_group' => $donor->blood_group,
                'area' => $donor->area,
                'last_donation_date' => $donor->last_donation_date?->toDateString(),
                // no phone here on purpose (privacy rule)
            ]);

        return Inertia::render('blood/donors', [
            'donors' => $donors,
            'filters' => $filters,
            'bloodGroups' => Donor::BLOOD_GROUPS,
        ]);
    }

    // Show "My donor profile" form
    public function edit(Request $request): Response
    {
        return Inertia::render('blood/my-donor', [
            'donor' => $request->user()->donor,
            'bloodGroups' => Donor::BLOOD_GROUPS,
            'gapDays' => Donor::DONATION_GAP_DAYS,
        ]);
    }

    // Register as donor (first time) or update (later)
    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'blood_group' => ['required', Rule::in(Donor::BLOOD_GROUPS)],
            'area' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:20'],
            'is_available' => ['required', 'boolean'],
            'last_donation_date' => ['nullable', 'date', 'before_or_equal:today'],
        ]);

        $request->user()->donor()->updateOrCreate([], $data);

        return redirect()->route('donors.edit');
    }
}