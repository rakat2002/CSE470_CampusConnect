import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    categories: string[];
}

export default function NewsletterSubmit({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        category: string;
        description: string;
        cover_image: File | null;
        relevant_links: string;
        event_link: string;
    }>({
        title: '',
        category: categories[0] || 'Club Activities',
        description: '',
        cover_image: null,
        relevant_links: '',
        event_link: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/newsletter/submit');
    }

    return (
        <>
            <Head title="Submit Newsletter Article" />

            <div className="mx-auto max-w-3xl p-6">
                <Link
                    href="/newsletter"
                    className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Newsletter
                </Link>

                <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-sm">
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Submit Content for Weekly Publication
                        </div>
                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Propose a Newsletter Article</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Club representatives, faculty members, and students can submit achievements, event announcements, research, or opportunities. Submissions will be reviewed by the editorial team.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Article Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g. BRACU Robotics Club Wins National RoboCup 2026"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                className="w-full rounded-md border border-input bg-background p-2.5 text-sm"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description & Content *</Label>
                            <textarea
                                id="description"
                                rows={8}
                                className="w-full rounded-md border border-input bg-background p-3 text-sm leading-relaxed"
                                placeholder="Provide the complete story, names of participants, achievements, schedule details, or opportunity criteria..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                required
                            />
                            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                        </div>

                        {/* Cover Image */}
                        <div className="space-y-2">
                            <Label htmlFor="cover_image">Cover Image (Optional)</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('cover_image', e.target.files?.[0] ?? null)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 4MB.</p>
                            {errors.cover_image && <p className="text-xs text-red-500">{errors.cover_image}</p>}
                        </div>

                        {/* Links */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="relevant_links">External Link (Optional)</Label>
                                <Input
                                    id="relevant_links"
                                    placeholder="https://..."
                                    value={data.relevant_links}
                                    onChange={(e) => setData('relevant_links', e.target.value)}
                                />
                                {errors.relevant_links && <p className="text-xs text-red-500">{errors.relevant_links}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_link">Campus Event Link (Optional)</Label>
                                <Input
                                    id="event_link"
                                    placeholder="Link to event record or page..."
                                    value={data.event_link}
                                    onChange={(e) => setData('event_link', e.target.value)}
                                />
                                {errors.event_link && <p className="text-xs text-red-500">{errors.event_link}</p>}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Link href="/newsletter">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                <Send className="mr-2 h-4 w-4" />
                                {processing ? 'Submitting...' : 'Submit for Review'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

NewsletterSubmit.layout = {
    breadcrumbs: [
        { title: 'Weekly Newsletter', href: '/newsletter' },
        { title: 'Submit Article', href: '/newsletter/submit' },
    ],
};
