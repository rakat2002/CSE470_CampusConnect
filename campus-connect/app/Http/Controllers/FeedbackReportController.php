<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\FeedbackReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackReportController extends Controller
{
    public function store(Request $request, Feedback $feedback)
    {
        // Students cannot report their own feedback
        abort_if($feedback->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'reason' => 'required|in:Abuse,Spam,Inappropriate Content',
            'details' => 'nullable|string|max:1000',
        ]);

        // Prevent duplicate reports
        $alreadyReported = FeedbackReport::where('feedback_id', $feedback->id)
            ->where('user_id', Auth::id())
            ->exists();

        if ($alreadyReported) {
            return back()->withErrors([
                'report' => 'You have already reported this feedback.',
            ]);
        }

        FeedbackReport::create([
            'feedback_id' => $feedback->id,
            'user_id' => Auth::id(),
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
        ]);

        return back()->with('success', 'Feedback reported successfully.');
    }
}