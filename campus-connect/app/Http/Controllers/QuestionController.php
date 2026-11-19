<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Reply;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    // Browse and search questions
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $search = trim((string) $request->input('search', ''));
        $status = $request->input('status'); // open, answered or empty

        $questions = Question::with('user:id,name,department')
            ->withCount(['replies' => fn ($q) => $q->where('is_hidden', false)])
            ->when(! $isAdmin, function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('is_hidden', false)->orWhere('user_id', $user->id);
                });
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                        ->orWhere('details', 'like', '%'.$search.'%')
                        ->orWhere('course_code', 'like', '%'.$search.'%')
                        ->orWhere('topic', 'like', '%'.$search.'%');
                });
            })
            ->when(in_array($status, ['open', 'answered'], true), fn ($query) => $query->where('status', $status))
            ->latest()
            ->get();

        return inertia('ResourceHub/Questions', [
            'questions' => $questions,
            'filters' => ['search' => $search, 'status' => $status ?? ''],
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'details' => 'required|string|max:5000',
            'course_code' => 'required|string|max:20',
            'topic' => 'nullable|string|max:100',
        ]);

        $question = Question::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'details' => $validated['details'],
            'course_code' => strtoupper($validated['course_code']),
            'topic' => $validated['topic'] ?? null,
            'status' => 'open',
        ]);

        return redirect()->route('questions.show', $question);
    }

    // One question with its replies
    public function show(Request $request, Question $question)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $isOwner = (int) $question->user_id === (int) $user->id;

        if ($question->is_hidden && ! $isOwner && ! $isAdmin) {
            abort(404);
        }

        $question->load([
            'user:id,name,department',
            'replies' => function ($q) use ($user, $isAdmin) {
                // Hidden replies: only the admin and the reply author can see them
                if (! $isAdmin) {
                    $q->where(fn ($r) => $r->where('is_hidden', false)->orWhere('user_id', $user->id));
                }
                // Accepted answer first, then oldest first
                $q->orderByDesc('is_accepted')->oldest()->with('user:id,name,department');
            },
        ]);

        return inertia('ResourceHub/QuestionShow', [
            'question' => $question,
            'currentUserId' => $user->id,
            'isOwner' => $isOwner,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function storeReply(Request $request, Question $question)
    {
        if ($question->is_hidden) {
            abort(404);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $question->replies()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return back();
    }

    // The question creator marks one reply as the accepted answer
    public function acceptReply(Request $request, Reply $reply)
    {
        $question = $reply->question;
        $userId = (int) $request->user()->id;

        abort_if((int) $question->user_id !== $userId, 403);

        if ((int) $reply->user_id === $userId) {
            return back()->withErrors(['answer' => 'You cannot accept your own reply.']);
        }

        if ($reply->is_hidden) {
            return back()->withErrors(['answer' => 'A hidden reply cannot be accepted.']);
        }

        if ($question->hasAcceptedAnswer()) {
            return back()->withErrors(['answer' => 'This question already has an accepted answer.']);
        }

        $reply->update(['is_accepted' => true]);
        $question->update(['status' => 'answered']);

        return back();
    }

    // Admin: hide or show again
    public function toggleHidden(Request $request, Question $question)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $question->update(['is_hidden' => ! $question->is_hidden]);

        return back();
    }

    public function toggleReplyHidden(Request $request, Reply $reply)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $reply->update(['is_hidden' => ! $reply->is_hidden]);

        return back();
    }
}
