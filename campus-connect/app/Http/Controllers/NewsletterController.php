<?php

namespace App\Http\Controllers;

use App\Models\NewsletterArticle;
use App\Models\NewsletterEdition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NewsletterController extends Controller
{
    // Browse current edition, archives, and search articles
    public function index(Request $request): Response
    {
        $user = $request->user();
        $category = $request->input('category');
        $search = trim((string) $request->input('search', ''));
        $tab = $request->input('tab', 'latest'); // latest, archive, bookmarks, my_submissions
        $selectedEditionId = $request->input('edition_id');

        $latestEdition = NewsletterEdition::where('status', 'published')
            ->latest('published_at')
            ->first();

        // If user chose a specific edition from archive, view that edition; otherwise default to latest
        $currentEdition = $selectedEditionId
            ? NewsletterEdition::where('status', 'published')->find($selectedEditionId)
            : $latestEdition;

        // Base query for approved/published articles
        $articlesQuery = NewsletterArticle::with(['edition', 'author:id,name,department,role'])
            ->where('status', 'approved');

        if ($tab === 'bookmarks') {
            $bookmarkedIds = $user->newsletterBookmarks ?? collect();
            $articlesQuery->whereHas('bookmarks', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($tab === 'my_submissions') {
            $articlesQuery = NewsletterArticle::with(['edition'])
                ->where('user_id', $user->id);
        } elseif ($currentEdition && $tab === 'latest') {
            $articlesQuery->where('newsletter_edition_id', $currentEdition->id);
        }

        if ($category) {
            $articlesQuery->where('category', $category);
        }

        if ($search !== '') {
            $articlesQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $userBookmarkIds = \App\Models\NewsletterBookmark::where('user_id', $user->id)
            ->pluck('newsletter_article_id')
            ->toArray();

        $articles = $articlesQuery->latest('published_at')->latest('id')->get()->map(function ($article) use ($userBookmarkIds, $user) {
            return [
                'id' => $article->id,
                'title' => $article->title,
                'description' => $article->description,
                'category' => $article->category,
                'cover_image' => $article->cover_image ? Storage::url($article->cover_image) : null,
                'relevant_links' => $article->relevant_links,
                'event_link' => $article->event_link,
                'status' => $article->status,
                'admin_feedback' => $article->admin_feedback,
                'views_count' => $article->views_count,
                'published_at' => $article->published_at?->toFormattedDateString() ?? $article->created_at->toFormattedDateString(),
                'author' => [
                    'name' => $article->author->name,
                    'department' => $article->author->department,
                    'role' => $article->author->role,
                ],
                'edition' => $article->edition ? [
                    'id' => $article->edition->id,
                    'edition_number' => $article->edition->edition_number,
                    'title' => $article->edition->title,
                ] : null,
                'is_bookmarked' => in_array($article->id, $userBookmarkIds, true),
                'is_owner' => $article->user_id === $user->id,
            ];
        });

        $editions = NewsletterEdition::where('status', 'published')
            ->withCount(['articles' => fn ($q) => $q->where('status', 'approved')])
            ->latest('published_at')
            ->get();

        return Inertia::render('Newsletter/Index', [
            'articles' => $articles,
            'latestEdition' => $latestEdition,
            'currentEdition' => $currentEdition,
            'editions' => $editions,
            'categories' => NewsletterArticle::CATEGORIES,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'tab' => $tab,
                'edition_id' => $selectedEditionId,
            ],
            'isAdmin' => $user->role === 'admin',
        ]);
    }

    public function show(Request $request, NewsletterArticle $article): Response
    {
        $user = $request->user();

        // Increment view count
        $article->increment('views_count');

        $isBookmarked = $article->isBookmarkedBy($user);

        return Inertia::render('Newsletter/Show', [
            'article' => [
                'id' => $article->id,
                'title' => $article->title,
                'description' => $article->description,
                'category' => $article->category,
                'cover_image' => $article->cover_image ? Storage::url($article->cover_image) : null,
                'relevant_links' => $article->relevant_links,
                'event_link' => $article->event_link,
                'views_count' => $article->views_count,
                'published_at' => $article->published_at?->toFormattedDateString() ?? $article->created_at->toFormattedDateString(),
                'author' => [
                    'name' => $article->author->name,
                    'department' => $article->author->department,
                    'role' => $article->author->role,
                ],
                'edition' => $article->edition ? [
                    'id' => $article->edition->id,
                    'edition_number' => $article->edition->edition_number,
                    'title' => $article->edition->title,
                ] : null,
                'is_bookmarked' => $isBookmarked,
                'is_owner' => $article->user_id === $user->id,
            ],
            'categories' => NewsletterArticle::CATEGORIES,
            'isAdmin' => $user->role === 'admin',
        ]);
    }

    public function createSubmission(): Response
    {
        return Inertia::render('Newsletter/Submit', [
            'categories' => NewsletterArticle::CATEGORIES,
        ]);
    }

    public function storeSubmission(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:20',
            'category' => ['required', Rule::in(NewsletterArticle::CATEGORIES)],
            'cover_image' => 'nullable|image|max:4096', // 4MB
            'relevant_links' => 'nullable|string|max:500',
            'event_link' => 'nullable|string|max:500',
        ]);

        $coverImagePath = null;
        if ($request->hasFile('cover_image')) {
            $coverImagePath = $request->file('cover_image')->store('newsletters', 'public');
        }

        $request->user()->newsletterArticles()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'cover_image' => $coverImagePath,
            'relevant_links' => $validated['relevant_links'] ?? null,
            'event_link' => $validated['event_link'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()->route('newsletter.index', ['tab' => 'my_submissions']);
    }

    public function toggleBookmark(Request $request, NewsletterArticle $article): RedirectResponse
    {
        $user = $request->user();
        $existing = \App\Models\NewsletterBookmark::where('user_id', $user->id)
            ->where('newsletter_article_id', $article->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            \App\Models\NewsletterBookmark::create([
                'user_id' => $user->id,
                'newsletter_article_id' => $article->id,
            ]);
        }

        return back();
    }

    // Admin Dashboard for Curating & Publishing Weekly Editions
    public function adminIndex(Request $request): Response
    {
        abort_if($request->user()->role !== 'admin', 403);

        $pendingArticles = NewsletterArticle::with('author:id,name,department,role')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $approvedArticles = NewsletterArticle::with(['author:id,name,department,role', 'edition'])
            ->where('status', 'approved')
            ->latest()
            ->get();

        $rejectedArticles = NewsletterArticle::with('author:id,name,department,role')
            ->where('status', 'rejected')
            ->latest()
            ->get();

        $editions = NewsletterEdition::withCount('articles')
            ->latest()
            ->get();

        return Inertia::render('Newsletter/Admin', [
            'pendingArticles' => $pendingArticles,
            'approvedArticles' => $approvedArticles,
            'rejectedArticles' => $rejectedArticles,
            'editions' => $editions,
            'categories' => NewsletterArticle::CATEGORIES,
        ]);
    }

    public function storeEdition(Request $request): RedirectResponse
    {
        abort_if($request->user()->role !== 'admin', 403);

        $validated = $request->validate([
            'edition_number' => 'required|integer|unique:newsletter_editions,edition_number',
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string|max:1000',
        ]);

        NewsletterEdition::create([
            'edition_number' => $validated['edition_number'],
            'title' => $validated['title'],
            'summary' => $validated['summary'] ?? null,
            'status' => 'draft',
        ]);

        return back();
    }

    public function updateSubmissionStatus(Request $request, NewsletterArticle $article): RedirectResponse
    {
        abort_if($request->user()->role !== 'admin', 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'newsletter_edition_id' => 'nullable|exists:newsletter_editions,id',
            'admin_feedback' => 'nullable|string|max:500',
        ]);

        $article->update([
            'status' => $validated['status'],
            'newsletter_edition_id' => $validated['newsletter_edition_id'] ?? $article->newsletter_edition_id,
            'admin_feedback' => $validated['admin_feedback'] ?? null,
            'published_at' => $validated['status'] === 'approved' ? ($article->published_at ?? now()) : null,
        ]);

        return back();
    }

    public function publishEdition(Request $request, NewsletterEdition $edition): RedirectResponse
    {
        abort_if($request->user()->role !== 'admin', 403);

        $edition->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Publish all assigned approved articles
        $edition->articles()->where('status', 'approved')->update([
            'published_at' => now(),
        ]);

        return back();
    }
}
