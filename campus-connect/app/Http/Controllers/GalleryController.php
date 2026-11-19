<?php

namespace App\Http\Controllers;

use App\Models\GalleryAlbum;
use App\Models\GalleryComment;
use App\Models\GalleryItem;
use App\Models\GalleryLike;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    // Main gallery explorer: view albums and chronological memories timeline
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $category = $request->input('category');
        $semester = $request->input('semester');
        $year = $request->input('year');
        $club = $request->input('club');
        $search = trim((string) $request->input('search', ''));
        $tab = $request->input('tab', 'feed'); // feed, albums, my_memories

        // Query for albums
        $albumsQuery = GalleryAlbum::with(['user:id,name,department', 'items' => fn ($q) => $q->where('is_hidden', false)])
            ->withCount('items');

        if ($category) {
            $albumsQuery->where('category', $category);
        }
        if ($semester) {
            $albumsQuery->where('semester', $semester);
        }
        if ($year) {
            $albumsQuery->where('year', $year);
        }
        if ($club) {
            $albumsQuery->where('club_name', 'like', "%{$club}%");
        }
        if ($search !== '') {
            $albumsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $albums = $albumsQuery->latest()->get()->map(function ($album) {
            $firstItem = $album->items->first();
            $cover = $album->cover_image ? Storage::url($album->cover_image) : null;
            if (! $cover && $firstItem) {
                $cover = $firstItem->type === 'photo' && $firstItem->file_path
                    ? Storage::url($firstItem->file_path)
                    : ($firstItem->youtube_video_id ? "https://img.youtube.com/vi/{$firstItem->youtube_video_id}/hqdefault.jpg" : null);
            }

            return [
                'id' => $album->id,
                'title' => $album->title,
                'description' => $album->description,
                'album_type' => $album->album_type,
                'category' => $album->category,
                'semester' => $album->semester,
                'year' => $album->year,
                'club_name' => $album->club_name,
                'department' => $album->department,
                'cover_image' => $cover,
                'items_count' => $album->items_count,
                'creator' => $album->user->name,
                'created_at' => $album->created_at->toFormattedDateString(),
            ];
        });

        // Query for individual media items (timeline feed)
        $itemsQuery = GalleryItem::with([
            'album',
            'user:id,name,department',
            'comments.user:id,name,department',
        ])
            ->withCount('likes')
            ->where('is_hidden', false);

        if ($tab === 'my_memories') {
            $itemsQuery->where('user_id', $user->id);
        }

        if ($category) {
            $itemsQuery->whereHas('album', fn ($q) => $q->where('category', $category));
        }

        if ($search !== '') {
            $itemsQuery->where(function ($q) use ($search) {
                $q->where('caption', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        $likedItemIds = GalleryLike::where('user_id', $user->id)->pluck('gallery_item_id')->toArray();

        $items = $itemsQuery->latest()->get()->map(function ($item) use ($likedItemIds, $user, $isAdmin) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'file_url' => $item->file_path ? Storage::url($item->file_path) : null,
                'youtube_url' => $item->youtube_url,
                'youtube_video_id' => $item->youtube_video_id,
                'caption' => $item->caption,
                'description' => $item->description,
                'tags' => $item->tags ? array_filter(array_map('trim', explode(',', $item->tags))) : [],
                'likes_count' => $item->likes_count,
                'is_liked' => in_array($item->id, $likedItemIds, true),
                'uploader' => [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                    'department' => $item->user->department,
                ],
                'album' => $item->album ? [
                    'id' => $item->album->id,
                    'title' => $item->album->title,
                    'category' => $item->album->category,
                    'club_name' => $item->album->club_name,
                ] : null,
                'comments' => $item->comments->map(fn ($c) => [
                    'id' => $c->id,
                    'content' => $c->content,
                    'created_at' => $c->created_at->diffForHumans(),
                    'user' => [
                        'id' => $c->user->id,
                        'name' => $c->user->name,
                    ],
                    'can_delete' => $c->user_id === $user->id || $item->user_id === $user->id || $isAdmin,
                ]),
                'can_delete' => $item->user_id === $user->id || $isAdmin,
                'created_at' => $item->created_at->diffForHumans(),
            ];
        });

        // Unique clubs for filtering
        $clubs = GalleryAlbum::whereNotNull('club_name')->distinct()->pluck('club_name');

        return Inertia::render('Gallery/Index', [
            'albums' => $albums,
            'items' => $items,
            'clubs' => $clubs,
            'categories' => GalleryAlbum::CATEGORIES,
            'semesters' => GalleryAlbum::SEMESTERS,
            'filters' => [
                'category' => $category,
                'semester' => $semester,
                'year' => $year,
                'club' => $club,
                'search' => $search,
                'tab' => $tab,
            ],
            'isAdmin' => $isAdmin,
            'currentUserId' => $user->id,
        ]);
    }

    // View specific album with its media collection
    public function showAlbum(Request $request, GalleryAlbum $album): Response
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        $album->load(['user:id,name,department']);

        $likedItemIds = GalleryLike::where('user_id', $user->id)->pluck('gallery_item_id')->toArray();

        $items = $album->items()
            ->with(['user:id,name,department', 'comments.user:id,name,department'])
            ->withCount('likes')
            ->where('is_hidden', false)
            ->latest()
            ->get()
            ->map(function ($item) use ($likedItemIds, $user, $isAdmin) {
                return [
                    'id' => $item->id,
                    'type' => $item->type,
                    'file_url' => $item->file_path ? Storage::url($item->file_path) : null,
                    'youtube_url' => $item->youtube_url,
                    'youtube_video_id' => $item->youtube_video_id,
                    'caption' => $item->caption,
                    'description' => $item->description,
                    'tags' => $item->tags ? array_filter(array_map('trim', explode(',', $item->tags))) : [],
                    'likes_count' => $item->likes_count,
                    'is_liked' => in_array($item->id, $likedItemIds, true),
                    'uploader' => [
                        'id' => $item->user->id,
                        'name' => $item->user->name,
                        'department' => $item->user->department,
                    ],
                    'comments' => $item->comments->map(fn ($c) => [
                        'id' => $c->id,
                        'content' => $c->content,
                        'created_at' => $c->created_at->diffForHumans(),
                        'user' => [
                            'id' => $c->user->id,
                            'name' => $c->user->name,
                        ],
                        'can_delete' => $c->user_id === $user->id || $item->user_id === $user->id || $isAdmin,
                    ]),
                    'can_delete' => $item->user_id === $user->id || $isAdmin,
                    'created_at' => $item->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Gallery/AlbumShow', [
            'album' => [
                'id' => $album->id,
                'title' => $album->title,
                'description' => $album->description,
                'album_type' => $album->album_type,
                'category' => $album->category,
                'semester' => $album->semester,
                'year' => $album->year,
                'club_name' => $album->club_name,
                'department' => $album->department,
                'creator' => $album->user->name,
                'is_owner' => $album->user_id === $user->id || $isAdmin,
                'created_at' => $album->created_at->toFormattedDateString(),
            ],
            'items' => $items,
            'categories' => GalleryAlbum::CATEGORIES,
            'semesters' => GalleryAlbum::SEMESTERS,
            'isAdmin' => $isAdmin,
            'currentUserId' => $user->id,
        ]);
    }

    public function storeAlbum(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'album_type' => ['required', Rule::in(['official_club', 'event', 'personal'])],
            'category' => ['required', Rule::in(GalleryAlbum::CATEGORIES)],
            'semester' => ['required', Rule::in(GalleryAlbum::SEMESTERS)],
            'year' => 'required|integer|min:2020|max:2035',
            'department' => 'nullable|string|max:100',
            'club_name' => 'nullable|string|max:150',
            'cover_image' => 'nullable|image|max:5120', // 5MB
        ]);

        $coverImagePath = null;
        if ($request->hasFile('cover_image')) {
            $coverImagePath = $request->file('cover_image')->store('gallery/covers', 'public');
        }

        $album = $request->user()->galleryAlbums()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'album_type' => $validated['album_type'],
            'category' => $validated['category'],
            'semester' => $validated['semester'],
            'year' => $validated['year'],
            'department' => $validated['department'] ?? null,
            'club_name' => $validated['club_name'] ?? null,
            'cover_image' => $coverImagePath,
        ]);

        return redirect()->route('gallery.album.show', $album->id);
    }

    public function storeMedia(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gallery_album_id' => 'nullable|exists:gallery_albums,id',
            'type' => ['required', Rule::in(['photo', 'video'])],
            'caption' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'tags' => 'nullable|string|max:255',
            'file' => 'required_if:type,photo|nullable|image|mimes:jpeg,jpg,png,webp|max:5120', // max 5MB
            'youtube_url' => 'required_if:type,video|nullable|url',
        ]);

        $filePath = null;
        $youtubeId = null;

        if ($validated['type'] === 'photo' && $request->hasFile('file')) {
            $filePath = $request->file('file')->store('gallery/photos', 'public');
        } elseif ($validated['type'] === 'video') {
            $youtubeId = GalleryItem::extractYouTubeId($validated['youtube_url'] ?? null);
            if (! $youtubeId) {
                return back()->withErrors(['youtube_url' => 'Please provide a valid YouTube video link.']);
            }
        }

        $request->user()->galleryItems()->create([
            'gallery_album_id' => $validated['gallery_album_id'] ?? null,
            'type' => $validated['type'],
            'file_path' => $filePath,
            'youtube_url' => $validated['youtube_url'] ?? null,
            'youtube_video_id' => $youtubeId,
            'caption' => $validated['caption'],
            'description' => $validated['description'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'is_hidden' => false,
        ]);

        return back();
    }

    public function toggleLike(Request $request, GalleryItem $item): RedirectResponse
    {
        $user = $request->user();
        $like = GalleryLike::where('user_id', $user->id)
            ->where('gallery_item_id', $item->id)
            ->first();

        if ($like) {
            $like->delete();
        } else {
            GalleryLike::create([
                'user_id' => $user->id,
                'gallery_item_id' => $item->id,
            ]);
        }

        return back();
    }

    public function storeComment(Request $request, GalleryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|min:1|max:500',
        ]);

        GalleryComment::create([
            'user_id' => $request->user()->id,
            'gallery_item_id' => $item->id,
            'content' => $validated['content'],
        ]);

        return back();
    }

    public function destroyComment(Request $request, GalleryComment $comment): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $itemOwner = $comment->item->user_id;

        abort_if($comment->user_id !== $user->id && $itemOwner !== $user->id && ! $isAdmin, 403);

        $comment->delete();

        return back();
    }

    public function destroyMedia(Request $request, GalleryItem $item): RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        abort_if($item->user_id !== $user->id && ! $isAdmin, 403);

        if ($item->file_path && Storage::disk('public')->exists($item->file_path)) {
            Storage::disk('public')->delete($item->file_path);
        }

        $item->delete();

        return back();
    }
}
