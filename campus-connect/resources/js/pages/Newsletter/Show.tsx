import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, ExternalLink, Eye, Flag, Share2, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    article: {
        id: number;
        title: string;
        description: string;
        category: string;
        cover_image: string | null;
        relevant_links: string | null;
        event_link: string | null;
        views_count: number;
        published_at: string;
        author: {
            name: string;
            department: string;
            role: string;
        };
        edition: {
            id: number;
            edition_number: number;
            title: string;
        } | null;
        is_bookmarked: boolean;
        is_owner: boolean;
    };
    categories: string[];
    isAdmin: boolean;
}

export default function NewsletterShow({ article, isAdmin }: Props) {
    const [reporting, setReporting] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportSent, setReportSent] = useState(false);

    function toggleBookmark() {
        router.post(`/newsletter/article/${article.id}/bookmark`, {}, { preserveScroll: true });
    }

    function submitReport() {
        if (!reportReason.trim()) return;
        router.post(
            '/content-reports',
            {
                type: 'newsletter_article',
                id: article.id,
                reason: reportReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReporting(false);
                    setReportSent(true);
                },
            }
        );
    }

    return (
        <>
            <Head title={article.title} />

            <div className="mx-auto max-w-4xl p-6">
                {/* Back Link */}
                <Link
                    href="/newsletter"
                    className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Newsletter
                </Link>

                <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    {/* Cover image */}
                    {article.cover_image && (
                        <div className="relative h-72 w-full overflow-hidden bg-muted sm:h-96">
                            <img
                                src={article.cover_image}
                                alt={article.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 sm:p-10">
                        {/* Meta tags */}
                        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
                            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">
                                {article.category}
                            </span>
                            {article.edition && (
                                <span className="rounded-full bg-purple-100 px-3 py-1 font-semibold text-purple-800">
                                    Edition #{article.edition.edition_number}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-3.5 w-3.5" />
                                {article.views_count} views
                            </span>
                        </div>

                        {/* Article Title */}
                        <h1 className="mb-6 text-2xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                            {article.title}
                        </h1>

                        {/* Author Byline */}
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold">
                                    {article.author.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-foreground text-sm">
                                        {article.author.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {article.author.department} · {article.author.role}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground mr-2">
                                    Published {article.published_at}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleBookmark}
                                    className="gap-1.5"
                                >
                                    {article.is_bookmarked ? (
                                        <>
                                            <BookmarkCheck className="h-4 w-4 text-blue-600" />
                                            Bookmarked
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="h-4 w-4 text-muted-foreground" />
                                            Bookmark
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReporting(true)}
                                    className="text-muted-foreground hover:text-red-600"
                                    title="Report article"
                                >
                                    <Flag className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-blue max-w-none whitespace-pre-line text-base leading-relaxed text-foreground/90">
                            {article.description}
                        </div>

                        {/* External & Event Links */}
                        {(article.relevant_links || article.event_link) && (
                            <div className="mt-8 rounded-xl border bg-muted/30 p-5">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                    Related Information & Links
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {article.event_link && (
                                        <a
                                            href={article.event_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                                        >
                                            <Calendar className="h-3.5 w-3.5" />
                                            Campus Event Page
                                        </a>
                                    )}
                                    {article.relevant_links && (
                                        <a
                                            href={article.relevant_links.startsWith('http') ? article.relevant_links : `https://${article.relevant_links}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            External Link
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Report Feedback Modal */}
                        {reporting && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                                <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border">
                                    <h3 className="text-lg font-bold">Report this Article</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        If this article contains misleading information, inappropriate content, or violates university guidelines, explain below.
                                    </p>
                                    <textarea
                                        rows={4}
                                        className="mt-3 w-full rounded-md border p-2.5 text-sm"
                                        placeholder="Reason for reporting..."
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                    />
                                    <div className="mt-4 flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setReporting(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={submitReport}>
                                            Submit Report
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reportSent && (
                            <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs font-medium text-green-800 border border-green-200">
                                Thank you. Your report has been submitted for administrator review.
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </>
    );
}

NewsletterShow.layout = {
    breadcrumbs: [
        { title: 'Weekly Newsletter', href: '/newsletter' },
        { title: 'Article', href: '#' },
    ],
};
