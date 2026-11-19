<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function index()
    {
        $feedbacks = Feedback::with('user:id,name')
            ->latest()
            ->get();

        $averageRating = Feedback::avg('rating');

        return Inertia::render('Feedback/Index', [
            'feedbacks' => $feedbacks,
            'currentUserId' => Auth::id(),
            'averageRating' => round($averageRating ?? 0, 1),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|in:Course,Facility,Service',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'is_anonymous' => 'required|boolean',
        ]);

        Feedback::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('feedback.index');
    }

    public function destroy(Feedback $feedback)
    {
        abort_unless($feedback->user_id === Auth::id(), 403);

        $feedback->delete();

        return redirect()->route('feedback.index');
    }
}