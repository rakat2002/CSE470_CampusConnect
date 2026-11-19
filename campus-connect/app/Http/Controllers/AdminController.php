<?php

namespace App\Http\Controllers;

use App\Models\Donor;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    // Admin Panel: counts + everything waiting for approval
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pendingListings' => Listing::where('status', 'pending')->count(),
                'pendingDonors' => Donor::where('approval_status', 'pending')->count(),
                'liveListings' => Listing::where('status', 'available')->count(),
                'approvedDonors' => Donor::where('approval_status', 'approved')->count(),
            ],
            'listings' => Listing::with('user:id,name,student_id,department')
                ->where('status', 'pending')->oldest()->get(),
            'donors' => Donor::with('user:id,name,student_id,department')
                ->where('approval_status', 'pending')->oldest()->get(),
        ]);
    }

    public function approveListing(Listing $listing): RedirectResponse
    {
        abort_unless($listing->status === 'pending', 422, 'Only pending listings can be approved.');
        $listing->update(['status' => 'available', 'rejection_reason' => null]);

        return back();
    }

    public function rejectListing(Request $request, Listing $listing): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        abort_unless($listing->status === 'pending', 422, 'Only pending listings can be rejected.');
        $listing->update(['status' => 'rejected', 'rejection_reason' => $data['reason']]);

        return back();
    }

    public function approveDonor(Donor $donor): RedirectResponse
    {
        abort_unless($donor->approval_status === 'pending', 422, 'Only pending donors can be approved.');
        $donor->update(['approval_status' => 'approved', 'rejection_reason' => null]);

        return back();
    }

    public function rejectDonor(Request $request, Donor $donor): RedirectResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        abort_unless($donor->approval_status === 'pending', 422, 'Only pending donors can be rejected.');
        $donor->update(['approval_status' => 'rejected', 'rejection_reason' => $data['reason']]);

        return back();
    }
}