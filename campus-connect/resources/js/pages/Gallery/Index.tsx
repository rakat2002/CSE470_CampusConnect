import { Head, Link, router, useForm } from '@inertiajs/react';
import { Camera, Calendar, Eye, Filter, Heart, Image as ImageIcon, MessageCircle, MoreVertical, Plus, Search, Trash2, Video, Youtube } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaItem {
    id: number;
    type: 'photo' | 'video';
    file_url: string | null;
    youtube_url: string | null;
    youtube_video_id: string | null;
    caption: string;
    description: string | null;
    tags: string[];
    likes_count: number;
    is_liked: boolean;
    uploader: {
        id: number;
        name: string;
        department: string;
    };
    album: {
        id: number;
        title: string;
        category: string;
        club_name: string | null;
    } | null;
    comments: {
        id: number;
        content: string;
        created_at: string;
        user: {
            id: number;
            name: string;
        };
        can_delete: boolean;
    }[];
    can_delete: boolean;
    created_at: string;
}

interface AlbumItem {
    id: number;
    title: string;
    description: string | null;
    album_type: string;
    category: string;
    semester: string;
    year: number;
    club_name: string | null;
    department: string | null;
    cover_image: string | null;
    items_count: number;
    creator: string;
    created_at: string;
}

interface Props {
    albums: AlbumItem[];
    items: MediaItem[];
    clubs: string[];
    categories: string[];
    semesters: string[];
    filters: {
        category?: string;
        semester?: string;
        year?: string;
        club?: string;
        search?: string;
        tab?: string;
    };
    isAdmin: boolean;
    currentUserId: number;
}

export default function GalleryIndex({
    albums,
    items,
    clubs,
    categories,
    semesters,
    filters,
    isAdmin,
    currentUserId,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const currentTab = filters.tab ?? 'feed';
    const activeCategory = filters.category ?? '';
    const activeSemester = filters.semester ?? '';
    const activeClub = filters.club ?? '';

    // Modals
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [activeCommentItemId, setActiveCommentItemId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');

    // Form to create an Album
    const albumForm = useForm({
        title: '',
        description: '',
        album_type: 'event', // official_club, event, personal
        category: categories[0] || 'Orientation',
        semester: semesters[0] || 'Fall',
        year: 2026,
        department: '',
        club_name: '',
        cover_image: null as File | null,
    });

    // Form to upload media (Photo or Video)
    const mediaForm = useForm({
        gallery_album_id: '' as string,
        type: 'photo' as 'photo' | 'video',
        caption: '',
        description: '',
        tags: '',
        file: null as File | null,
        youtube_url: '',
    });

    function handleFilterSubmit(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/gallery',
            {
                search,
                category: activeCategory,
                semester: activeSemester,
                club: activeClub,
                tab: currentTab,
            },
            { preserveState: true }
        );
    }

    function selectCategory(cat: string) {
        router.get(
            '/gallery',
            {
                search,
                category: cat === activeCategory ? '' : cat,
                semester: activeSemester,
                club: activeClub,
                tab: currentTab,
            },
            { preserveState: true }
        );
    }

    function switchTab(newTab: string) {
        router.get('/gallery', {
            tab: newTab,
            category: activeCategory,
            semester: activeSemester,
            club: activeClub,
        });
    }

    function toggleLike(itemId: number) {
        router.post(`/gallery/media/${itemId}/like`, {}, { preserveScroll: true });
    }

    function submitComment(itemId: number) {
        if (!commentText.trim()) return;
        router.post(
            `/gallery/media/${itemId}/comments`,
            { content: commentText },
            {
                preserveScroll: true,
                onSuccess: () => setCommentText(''),
            }
        );
    }

    function deleteComment(commentId: number) {
        router.delete(`/gallery/comments/${commentId}`, { preserveScroll: true });
    }

    function deleteMedia(itemId: number) {
        if (confirm('Are you sure you want to delete this memory?')) {
            router.delete(`/gallery/media/${itemId}`, { preserveScroll: true });
        }
    }

    function handleCreateAlbum(e: FormEvent) {
        e.preventDefault();
        albumForm.post('/gallery/albums', {
            onSuccess: () => {
                setShowAlbumModal(false);
                albumForm.reset();
            },
        });
    }

    function handleUploadMedia(e: FormEvent) {
        e.preventDefault();
        mediaForm.post('/gallery/media', {
            onSuccess: () => {
                setShowUploadModal(false);
                mediaForm.reset();
            },
        });
    }

    return (
        <>
            <Head title="Campus Memory Gallery" />

            <div className="mx-auto max-w-7xl p-6">
                {/* Hero Banner */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                <Camera className="h-3.5 w-3.5" />
                                Preserving Campus Moments
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                Campus Memory Gallery
                            </h1>
                            <p className="mt-2 max-w-2xl text-emerald-100">
                                Explore and share unforgettable memories from club events, hackathons, workshops, cultural nights, and student life across BRAC University.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => setShowAlbumModal(true)}
                                variant="outline"
                                className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Create Album
                            </Button>
                            <Button
                                onClick={() => setShowUploadModal(true)}
                                className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-md"
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                Add Photo / Video
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={currentTab === 'feed' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('feed')}
                        >
                            Memories Timeline
                        </Button>
                        <Button
                            variant={currentTab === 'albums' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('albums')}
                        >
                            Albums Explorer ({albums.length})
                        </Button>
                        <Button
                            variant={currentTab === 'my_memories' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('my_memories')}
                        >
                            My Uploads
                        </Button>
                    </div>

                    <form onSubmit={handleFilterSubmit} className="flex gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search memories, tags..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="sm" variant="secondary">
                            Search
                        </Button>
                    </form>
                </div>

                {/* Category Pills */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground flex items-center mr-1">
                        <Filter className="mr-1 h-3 w-3" /> Categories:
                    </span>
                    <button
                        type="button"
                        onClick={() => selectCategory('')}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            activeCategory === ''
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => selectCategory(cat)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                activeCategory === cat
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* TAB 1: ALBUMS EXPLORER */}
                {currentTab === 'albums' && (
                    <>
                        {albums.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                                <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground/60" />
                                <h3 className="text-lg font-semibold">No albums found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Create an album to start organizing campus event memories.
                                </p>
                                <Button size="sm" className="mt-4" onClick={() => setShowAlbumModal(true)}>
                                    Create Album
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {albums.map((album) => (
                                    <Link
                                        key={album.id}
                                        href={`/gallery/albums/${album.id}`}
                                        className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                                            {album.cover_image ? (
                                                <img
                                                    src={album.cover_image}
                                                    alt={album.title}
                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-teal-500 to-emerald-600 text-white">
                                                    <Camera className="h-10 w-10 opacity-50" />
                                                </div>
                                            )}
                                            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                                {album.category}
                                            </span>
                                            <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                                                {album.items_count} item{album.items_count === 1 ? '' : 's'}
                                            </span>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                <span>
                                                    {album.semester} {album.year}
                                                </span>
                                                {album.club_name && (
                                                    <span className="font-medium text-emerald-700">
                                                        {album.club_name}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-bold group-hover:text-emerald-600">
                                                {album.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {album.description || 'Event photo & video collection.'}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2 & 3: TIMELINE FEED & MY UPLOADS */}
                {currentTab !== 'albums' && (
                    <>
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                                <Camera className="mb-3 h-12 w-12 text-muted-foreground/60" />
                                <h3 className="text-lg font-semibold">No media items found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Be the first to share photos or YouTube videos from recent campus events!
                                </p>
                                <Button size="sm" className="mt-4" onClick={() => setShowUploadModal(true)}>
                                    Upload a Memory
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md"
                                    >
                                        <div>
                                            {/* Media Header (Photo vs Video) */}
                                            {item.type === 'video' && item.youtube_video_id ? (
                                                <div className="relative aspect-video w-full overflow-hidden bg-black">
                                                    <iframe
                                                        className="h-full w-full"
                                                        src={`https://www.youtube-nocookie.com/embed/${item.youtube_video_id}`}
                                                        title={item.caption}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative h-56 w-full overflow-hidden bg-muted">
                                                    {item.file_url ? (
                                                        <img
                                                            src={item.file_url}
                                                            alt={item.caption}
                                                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                                            <ImageIcon className="h-10 w-10 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="p-4">
                                                {item.album && (
                                                    <Link
                                                        href={`/gallery/albums/${item.album.id}`}
                                                        className="mb-1 inline-block text-xs font-semibold text-emerald-700 hover:underline"
                                                    >
                                                        📁 {item.album.title}
                                                    </Link>
                                                )}

                                                <h3 className="text-base font-bold text-foreground">
                                                    {item.caption}
                                                </h3>

                                                {item.description && (
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {/* Tags */}
                                                {item.tags.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {item.tags.map((t, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                                            >
                                                                #{t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="border-t p-3 pt-2">
                                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    by <span className="font-medium text-foreground">{item.uploader.name}</span>
                                                </span>
                                                <span>{item.created_at}</span>
                                            </div>

                                            <div className="flex items-center justify-between border-t pt-2">
                                                <div className="flex items-center gap-3">
                                                    {/* Like Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleLike(item.id)}
                                                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-red-500 transition"
                                                    >
                                                        <Heart
                                                            className={`h-4 w-4 ${
                                                                item.is_liked
                                                                    ? 'fill-red-500 text-red-500'
                                                                    : 'text-muted-foreground'
                                                            }`}
                                                        />
                                                        {item.likes_count}
                                                    </button>

                                                    {/* Comments Trigger */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setActiveCommentItemId(
                                                                activeCommentItemId === item.id ? null : item.id
                                                            )
                                                        }
                                                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-blue-500 transition"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                        {item.comments.length}
                                                    </button>
                                                </div>

                                                {item.can_delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                                        onClick={() => deleteMedia(item.id)}
                                                        title="Delete memory"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Expandable Comments Drawer */}
                                            {activeCommentItemId === item.id && (
                                                <div className="mt-3 rounded-lg border bg-muted/30 p-2.5">
                                                    <div className="max-h-40 space-y-2 overflow-y-auto text-xs">
                                                        {item.comments.length === 0 ? (
                                                            <p className="text-muted-foreground">No comments yet.</p>
                                                        ) : (
                                                            item.comments.map((c) => (
                                                                <div key={c.id} className="flex justify-between gap-2 border-b pb-1 last:border-0">
                                                                    <div>
                                                                        <span className="font-semibold text-foreground">
                                                                            {c.user.name}:
                                                                        </span>{' '}
                                                                        {c.content}
                                                                    </div>
                                                                    {c.can_delete && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => deleteComment(c.id)}
                                                                            className="text-[10px] text-red-500 hover:underline"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex gap-1.5">
                                                        <Input
                                                            placeholder="Add a comment..."
                                                            className="h-7 text-xs"
                                                            value={commentText}
                                                            onChange={(e) => setCommentText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    submitComment(item.id);
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => submitComment(item.id)}
                                                        >
                                                            Send
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* MODAL 1: Create Album */}
                {showAlbumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border">
                            <h3 className="text-lg font-bold">Create Campus Memory Album</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Organize memories for a specific event, club activity, or graduation batch.
                            </p>

                            <form onSubmit={handleCreateAlbum} className="mt-4 space-y-3">
                                <div>
                                    <Label htmlFor="alb_title">Album Title *</Label>
                                    <Input
                                        id="alb_title"
                                        placeholder="e.g. BRACU Hackathon 2026 Finals"
                                        value={albumForm.data.title}
                                        onChange={(e) => albumForm.setData('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="alb_cat">Category *</Label>
                                        <select
                                            id="alb_cat"
                                            className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                            value={albumForm.data.category}
                                            onChange={(e) => albumForm.setData('category', e.target.value)}
                                        >
                                            {categories.map((c) => (
                                                <option key={c} value={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="alb_type">Album Type *</Label>
                                        <select
                                            id="alb_type"
                                            className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                            value={albumForm.data.album_type}
                                            onChange={(e) => albumForm.setData('album_type', e.target.value)}
                                        >
                                            <option value="event">Campus Event</option>
                                            <option value="official_club">Official Club Album</option>
                                            <option value="personal">Student Album</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="alb_sem">Semester</Label>
                                        <select
                                            id="alb_sem"
                                            className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                            value={albumForm.data.semester}
                                            onChange={(e) => albumForm.setData('semester', e.target.value)}
                                        >
                                            {semesters.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="alb_year">Year</Label>
                                        <Input
                                            id="alb_year"
                                            type="number"
                                            value={albumForm.data.year}
                                            onChange={(e) => albumForm.setData('year', parseInt(e.target.value) || 2026)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="alb_club">Club Name (Optional)</Label>
                                    <Input
                                        id="alb_club"
                                        placeholder="e.g. BRACU Robotics Club, ROBU"
                                        value={albumForm.data.club_name}
                                        onChange={(e) => albumForm.setData('club_name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="alb_desc">Description (Optional)</Label>
                                    <textarea
                                        id="alb_desc"
                                        rows={2}
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                        value={albumForm.data.description}
                                        onChange={(e) => albumForm.setData('description', e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAlbumModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={albumForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Create Album
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: Add Photo or Video */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border">
                            <h3 className="text-lg font-bold">Add Campus Memory</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Upload a high-quality photo or embed a video via a YouTube link.
                            </p>

                            <form onSubmit={handleUploadMedia} className="mt-4 space-y-3">
                                {/* Type selector */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => mediaForm.setData('type', 'photo')}
                                        className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                                            mediaForm.data.type === 'photo'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Photo Upload
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => mediaForm.setData('type', 'video')}
                                        className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition ${
                                            mediaForm.data.type === 'video'
                                                ? 'border-red-600 bg-red-50 text-red-800'
                                                : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                    >
                                        <Youtube className="h-4 w-4 text-red-600" />
                                        YouTube Video Link
                                    </button>
                                </div>

                                <div>
                                    <Label htmlFor="med_album">Assign to Album (Optional)</Label>
                                    <select
                                        id="med_album"
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                        value={mediaForm.data.gallery_album_id}
                                        onChange={(e) => mediaForm.setData('gallery_album_id', e.target.value)}
                                    >
                                        <option value="">-- Standalone Campus Memory --</option>
                                        {albums.map((alb) => (
                                            <option key={alb.id} value={alb.id}>
                                                {alb.title} ({alb.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="med_caption">Caption *</Label>
                                    <Input
                                        id="med_caption"
                                        placeholder="e.g. Award ceremony at BRACU Auditorium"
                                        value={mediaForm.data.caption}
                                        onChange={(e) => mediaForm.setData('caption', e.target.value)}
                                        required
                                    />
                                </div>

                                {mediaForm.data.type === 'photo' ? (
                                    <div>
                                        <Label htmlFor="med_file">Photo File (JPG, PNG, WebP up to 5MB) *</Label>
                                        <Input
                                            id="med_file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => mediaForm.setData('file', e.target.files?.[0] ?? null)}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="med_yt">YouTube Video URL *</Label>
                                        <Input
                                            id="med_yt"
                                            placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                                            value={mediaForm.data.youtube_url}
                                            onChange={(e) => mediaForm.setData('youtube_url', e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="med_tags">Tags (comma separated, e.g. hackathon, robocup, 2026)</Label>
                                    <Input
                                        id="med_tags"
                                        placeholder="hackathon, robocup, friends"
                                        value={mediaForm.data.tags}
                                        onChange={(e) => mediaForm.setData('tags', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="med_desc">Description (Optional)</Label>
                                    <textarea
                                        id="med_desc"
                                        rows={2}
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                        placeholder="Story behind this moment..."
                                        value={mediaForm.data.description}
                                        onChange={(e) => mediaForm.setData('description', e.target.value)}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={mediaForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {mediaForm.processing ? 'Uploading...' : 'Save Memory'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

GalleryIndex.layout = {
    breadcrumbs: [{ title: 'Memory Gallery', href: '/gallery' }],
};
