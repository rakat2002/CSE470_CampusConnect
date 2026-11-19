<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CollaborationPost;
use App\Models\CollaborationRequest;
use App\Models\CollaborationInvitation;

class CollaborationInvitationController extends Controller
{
    // The post owner invites a student (by Student ID) to an open post
    public function store(Request $request, CollaborationPost $collaborationPost)
    {
        if ($collaborationPost->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationPost->status !== 'open') {
            return back()->withErrors([
                'invite' => 'You can only invite students to an open post.',
            ]);
        }

        $validated = $request->validate([
            'student_id' => 'required|string',
        ]);

        $student = User::where('student_id', $validated['student_id'])->first();

        if (! $student) {
            return back()->withErrors([
                'invite' => 'No student found with this Student ID.',
            ]);
        }

        if ($student->id == $request->user()->id) {
            return back()->withErrors([
                'invite' => 'You cannot invite yourself.',
            ]);
        }

        $isMember = CollaborationRequest::where('collaboration_post_id', $collaborationPost->id)
            ->where('user_id', $student->id)
            ->where('status', 'accepted')
            ->exists();

        if ($isMember) {
            return back()->withErrors([
                'invite' => 'This student is already in your team.',
            ]);
        }

        $existingInvitation = CollaborationInvitation::where('collaboration_post_id', $collaborationPost->id)
            ->where('user_id', $student->id)
            ->first();

        if ($existingInvitation && $existingInvitation->status === 'pending') {
            return back()->withErrors([
                'invite' => 'This student already has a pending invitation.',
            ]);
        }

        // A declined invitation can be sent again
        if ($existingInvitation) {
            $existingInvitation->update(['status' => 'pending']);
        } else {
            CollaborationInvitation::create([
                'collaboration_post_id' => $collaborationPost->id,
                'user_id' => $student->id,
                'status' => 'pending',
            ]);
        }

        return back()->with('success', 'Invitation sent to ' . $student->name . '.');
    }

    // The invited student accepts: they become an accepted team member
    public function accept(Request $request, CollaborationInvitation $collaborationInvitation)
    {
        if ($collaborationInvitation->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationInvitation->status !== 'pending') {
            return back()->withErrors([
                'invite' => 'This invitation has already been answered.',
            ]);
        }

        $post = $collaborationInvitation->collaborationPost;

        if ($post->status !== 'open' || $post->isFull()) {
            return back()->withErrors([
                'invite' => 'This post is no longer accepting teammates.',
            ]);
        }

        $collaborationInvitation->update(['status' => 'accepted']);

        // Team membership is stored as an accepted request (one row per student per post).
        // If the student already sent a request, we reuse it and keep their message.
        $membership = CollaborationRequest::firstOrNew([
            'collaboration_post_id' => $post->id,
            'user_id' => $request->user()->id,
        ]);

        if (! $membership->exists) {
            $membership->message = 'Joined by invitation';
        }

        $membership->status = 'accepted';
        $membership->save();

        $post->refreshStatus();

        return back()->with('success', 'You joined the team.');
    }

    public function decline(Request $request, CollaborationInvitation $collaborationInvitation)
    {
        if ($collaborationInvitation->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationInvitation->status !== 'pending') {
            return back()->withErrors([
                'invite' => 'This invitation has already been answered.',
            ]);
        }

        $collaborationInvitation->update(['status' => 'declined']);

        return back()->with('success', 'Invitation declined.');
    }
}
