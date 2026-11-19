import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, Heart, Image as ImageIcon, MessageCircle, Plus, Trash2, Youtube } from 'lucide-react';
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

interface AlbumDetail {
    id: number;
    title: string;
    description: string | null;
    album_type: string;
    category: string;
    semester: string;
    year: number;
    club_name: string | null;
    department: string | null;
    creator: string;
    is_owner: boolean;
    created_at: string;
}

interface Props {
    album: AlbumDetail;
    items: MediaItem[];
    categories: string[];
    semesters: string[];
    isAdmin: boolean;
    currentUserId: number;
}

export default function GalleryAlbumShow({
    album,
    items,
    isAdmin,
    currentUserId,
}: Props) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeCommentItemId, setActiveCommentItemId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');

    const mediaForm = useForm({
        gallery_album_id: album.id.toString(),
        type: 'photo' as 'photo' | 'video',
        caption: '',
        description: '',
        tags: '',
        file: null as File | null,
        youtube_url: '',
    });

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
            <Head title={`${album.title} - Memory Album`} />

            <div className="mx-auto max-w-7xl p-6">
                <Link
                    href="/gallery"
                    className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Memory Gallery
                </Link>

                {/* Album Header */}
                <div className="mb-8 rounded-2xl border bg-card p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                                    {album.category}
                                </span>
                                <span className="rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
                                    {album.semester} {album.year}
                                </span>
                                {album.club_name && (
                                    <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-800">
                                        {album.club_name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-extrabold sm:text-3xl text-foreground">
                                {album.title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                                {album.description || 'Collection of moments from this event.'}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Created by <span className="font-semibold text-foreground">{album.creator}</span> · {items.length} memory item{items.length === 1 ? '' : 's'}
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Memory to Album
                        </Button>
                    </div>
                </div>

                {/* Items Grid */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                        <Camera className="mb-3 h-12 w-12 text-muted-foreground/60" />
                        <h3 className="text-lg font-semibold">No memories in this album yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Upload photos or add YouTube video clips from this campus event!
                        </p>
                        <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowUploadModal(true)}>
                            Add Photo or Video
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
                                        <h3 className="text-base font-bold text-foreground">
                                            {item.caption}
                                        </h3>
                                        {item.description && (
                                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                {item.description}
                                            </p>
                                        )}
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

                                <div className="border-t p-3 pt-2">
                                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            Uploaded by <span className="font-medium text-foreground">{item.uploader.name}</span>
                                        </span>
                                        <span>{item.created_at}</span>
                                    </div>

                                    <div className="flex items-center justify-between border-t pt-2">
                                        <div className="flex items-center gap-3">
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

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border">
                            <h3 className="text-lg font-bold">Add Memory to "{album.title}"</h3>

                            <form onSubmit={handleUploadMedia} className="mt-4 space-y-3">
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
                                    <Label htmlFor="item_caption">Caption *</Label>
                                    <Input
                                        id="item_caption"
                                        placeholder="e.g. Finals round winners announcement"
                                        value={mediaForm.data.caption}
                                        onChange={(e) => mediaForm.setData('caption', e.target.value)}
                                        required
                                    />
                                </div>

                                {mediaForm.data.type === 'photo' ? (
                                    <div>
                                        <Label htmlFor="item_file">Photo File (JPG, PNG, WebP up to 5MB) *</Label>
                                        <Input
                                            id="item_file"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => mediaForm.setData('file', e.target.files?.[0] ?? null)}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <Label htmlFor="item_yt">YouTube Video URL *</Label>
                                        <Input
                                            id="item_yt"
                                            placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                                            value={mediaForm.data.youtube_url}
                                            onChange={(e) => mediaForm.setData('youtube_url', e.target.value)}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="item_tags">Tags (comma separated)</Label>
                                    <Input
                                        id="item_tags"
                                        placeholder="final, winners, celebration"
                                        value={mediaForm.data.tags}
                                        onChange={(e) => mediaForm.setData('tags', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="item_desc">Description (Optional)</Label>
                                    <textarea
                                        id="item_desc"
                                        rows={2}
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
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
                                        {mediaForm.processing ? 'Uploading...' : 'Save to Album'}
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

GalleryAlbumShow.layout = {
    breadcrumbs: [
        { title: 'Memory Gallery', href: '/gallery' },
        { title: 'Album View', href: '#' },
    ],
};
