<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CollaborationPost;
use App\Models\CollaborationRequest;
use App\Models\CollaborationInvitation;

class CollaborationPostController extends Controller
{
    public function index()
    {
        $currentUserId = auth()->id();

        $posts = CollaborationPost::with([
            'user',
            'collaborationRequests.user',
            'acceptedRequests.user',
            'invitations.user',
        ])
            // Show: open posts, my own posts, and posts where I am an accepted member
            ->where(function ($query) use ($currentUserId) {
                $query->where('status', 'open')
                    ->orWhere('user_id', $currentUserId)
                    ->orWhereHas('collaborationRequests', function ($q) use ($currentUserId) {
                        $q->where('user_id', $currentUserId)
                            ->where('status', 'accepted');
                    });
            })
            ->latest()
            ->get();

        // Privacy: other students only see their own request, and no invitations
        $posts->each(function ($post) use ($currentUserId) {
            if ($post->user_id != $currentUserId) {
                $post->setRelation(
                    'collaborationRequests',
                    $post->collaborationRequests
                        ->where('user_id', $currentUserId)
                        ->values()
                );

                $post->setRelation('invitations', collect());
            }
        });

        // Invitations I received and have not answered yet
        $myInvitations = CollaborationInvitation::with('collaborationPost.user')
            ->where('user_id', $currentUserId)
            ->where('status', 'pending')
            ->latest()
            ->get();

        return inertia('Collaboration/Index', [
            'posts' => $posts,
            'currentUserId' => $currentUserId,
            'myInvitations' => $myInvitations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->postRules());

        $request->user()->collaborationPosts()->create($validated);

        return redirect()->route('collaboration.index');
    }

    public function sendRequest(Request $request, CollaborationPost $collaborationPost)
    {
        if ($collaborationPost->user_id == $request->user()->id) {
            return back()->withErrors([
                'request' => 'You cannot request to join your own post.',
            ]);
        }

        if ($collaborationPost->status !== 'open') {
            return back()->withErrors([
                'request' => 'This collaboration post is not accepting requests.',
            ]);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:1000',
        ]);

        $existingRequest = CollaborationRequest::where('collaboration_post_id', $collaborationPost->id)
            ->where('user_id', $request->user()->id)
            ->first();

        // A cancelled request can be sent again. Any other request blocks a second one.
        if ($existingRequest && $existingRequest->status !== 'cancelled') {
            return back()->withErrors([
                'request' => 'You have already requested to join this post.',
            ]);
        }

        if ($existingRequest) {
            $existingRequest->update([
                'message' => $validated['message'] ?? null,
                'status' => 'pending',
            ]);
        } else {
            CollaborationRequest::create([
                'collaboration_post_id' => $collaborationPost->id,
                'user_id' => $request->user()->id,
                'message' => $validated['message'] ?? null,
                'status' => 'pending',
            ]);
        }

        return back()->with('success', 'Your collaboration request was sent.');
    }

    // The student who sent a request can cancel it while it is pending
    public function cancelRequest(Request $request, CollaborationRequest $collaborationRequest)
    {
        if ($collaborationRequest->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationRequest->status !== 'pending') {
            return back()->withErrors([
                'request' => 'Only pending requests can be cancelled.',
            ]);
        }

        $collaborationRequest->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Your request was cancelled.');
    }

    public function updateRequestStatus(
        Request $request,
        CollaborationRequest $collaborationRequest
    ) {
        $post = $collaborationRequest->collaborationPost;

        if ($post->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationRequest->status !== 'pending') {
            return back()->withErrors([
                'request' => 'This request has already been processed.',
            ]);
        }

        if ($post->status === 'closed') {
            return back()->withErrors([
                'request' => 'This post is closed.',
            ]);
        }

        $validated = $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        // Rejecting is always allowed. Accepting needs an open post with free places.
        if ($validated['status'] === 'accepted' && ($post->status !== 'open' || $post->isFull())) {
            return back()->withErrors([
                'request' => 'Your team already has enough members.',
            ]);
        }

        $collaborationRequest->update([
            'status' => $validated['status'],
        ]);

        // Becomes Full automatically when the limit is reached
        $post->refreshStatus();

        return back()->with(
            'success',
            'Collaboration request ' . $validated['status'] . ' successfully.'
        );
    }

    // Edit an open collaboration post
    public function update(Request $request, CollaborationPost $collaborationPost)
    {
        if ($collaborationPost->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationPost->status !== 'open') {
            return back()->withErrors([
                'post' => 'Only open posts can be edited.',
            ]);
        }

        $validated = $request->validate($this->postRules());

        if ($validated['teammates_needed'] < $collaborationPost->acceptedCount()) {
            return back()->withErrors([
                'teammates_needed' => 'The number cannot be less than your existing accepted members.',
            ]);
        }

        $collaborationPost->update($validated);

        // If the new number equals the accepted members, the post becomes Full
        $collaborationPost->refreshStatus();

        return back()->with('success', 'Collaboration post updated successfully.');
    }

    // Manually close a collaboration post
    public function close(Request $request, CollaborationPost $collaborationPost)
    {
        if ($collaborationPost->user_id != $request->user()->id) {
            abort(403);
        }

        if ($collaborationPost->status === 'closed') {
            return back()->withErrors([
                'post' => 'This post is already closed.',
            ]);
        }

        $collaborationPost->update([
            'status' => 'closed',
        ]);

        return back()->with('success', 'Collaboration post closed successfully.');
    }

    // Validation rules shared by create and edit
    private function postRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'activity_type' => 'required|string',
            'required_skills' => 'required|string',
            'department' => 'required|string',
            'course_code' => 'nullable|string',
            'section' => ['nullable', 'string', 'required_if:activity_type,Assignment,Course Project'],
            'teammates_needed' => 'required|integer|min:1',
        ];
    }
}
