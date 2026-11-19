import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, CheckCircle2, Clock, Eye, Plus, Send, ShieldCheck, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ArticleItem {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    views_count: number;
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
    created_at: string;
}

interface EditionItem {
    id: number;
    edition_number: number;
    title: string;
    summary: string | null;
    status: string;
    published_at: string | null;
    articles_count: number;
}

interface Props {
    pendingArticles: ArticleItem[];
    approvedArticles: ArticleItem[];
    rejectedArticles: ArticleItem[];
    editions: EditionItem[];
    categories: string[];
}

export default function NewsletterAdmin({
    pendingArticles,
    approvedArticles,
    rejectedArticles,
    editions,
}: Props) {
    const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [selectedEditionId, setSelectedEditionId] = useState<string>('');
    const [adminFeedback, setAdminFeedback] = useState<string>('');

    // Form to create a new edition
    const editionForm = useForm({
        edition_number: (editions.length > 0 ? Math.max(...editions.map((e) => e.edition_number)) + 1 : 1).toString(),
        title: `Edition ${editions.length + 1} - Fall 2026`,
        summary: '',
    });

    function createEdition(e: FormEvent) {
        e.preventDefault();
        editionForm.post('/newsletter/admin/editions', {
            onSuccess: () => editionForm.reset(),
        });
    }

    function publishEdition(editionId: number) {
        if (!confirm('Are you sure you want to publish this edition now? All assigned approved articles will be made live.')) {
            return;
        }
        router.patch(`/newsletter/admin/editions/${editionId}/publish`);
    }

    function handleSubmissionDecision() {
        if (!selectedArticle || !actionType) return;

        router.patch(
            `/newsletter/admin/articles/${selectedArticle.id}/status`,
            {
                status: actionType === 'approve' ? 'approved' : 'rejected',
                newsletter_edition_id: actionType === 'approve' && selectedEditionId ? selectedEditionId : null,
                admin_feedback: adminFeedback,
            },
            {
                onSuccess: () => {
                    setSelectedArticle(null);
                    setActionType(null);
                    setAdminFeedback('');
                    setSelectedEditionId('');
                },
            }
        );
    }

    return (
        <>
            <Head title="Newsletter Editorial Desk" />

            <div className="mx-auto max-w-7xl p-6">
                <Link
                    href="/newsletter"
                    className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Newsletter
                </Link>

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin Moderation & Editorial
                        </div>
                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Newsletter Editorial Desk</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Review article submissions from clubs and faculty, organize weekly editions, and publish new issues.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Manage Weekly Editions */}
                    <div className="space-y-6">
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-bold">Create New Weekly Edition</h2>
                            <form onSubmit={createEdition} className="mt-4 space-y-3">
                                <div>
                                    <Label htmlFor="ed_number">Edition Number</Label>
                                    <Input
                                        id="ed_number"
                                        type="number"
                                        value={editionForm.data.edition_number}
                                        onChange={(e) => editionForm.setData('edition_number', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ed_title">Title / Name</Label>
                                    <Input
                                        id="ed_title"
                                        placeholder="e.g. Issue 42: Midterm Highlights"
                                        value={editionForm.data.title}
                                        onChange={(e) => editionForm.setData('title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ed_summary">Summary Note (Optional)</Label>
                                    <textarea
                                        id="ed_summary"
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                        placeholder="Key theme of this weekly issue..."
                                        value={editionForm.data.summary}
                                        onChange={(e) => editionForm.setData('summary', e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={editionForm.processing}
                                    className="w-full"
                                >
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Edition Draft
                                </Button>
                            </form>
                        </div>

                        {/* Existing Editions List */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h2 className="text-lg font-bold">All Editions</h2>
                            <div className="mt-3 space-y-3">
                                {editions.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No editions created yet.</p>
                                ) : (
                                    editions.map((ed) => (
                                        <div
                                            key={ed.id}
                                            className="flex flex-col justify-between rounded-lg border p-3 text-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">
                                                    #{ed.edition_number} · {ed.title}
                                                </span>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        ed.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {ed.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{ed.articles_count} articles</span>
                                                {ed.status === 'draft' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-7 bg-green-600 hover:bg-green-700 text-xs"
                                                        onClick={() => publishEdition(ed.id)}
                                                    >
                                                        Publish Now
                                                    </Button>
                                                ) : (
                                                    <span>Published {ed.published_at}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Submissions Queue */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pending Submissions */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-bold">
                                    <Clock className="h-5 w-5 text-amber-500" />
                                    Pending Article Submissions ({pendingArticles.length})
                                </h2>
                            </div>

                            {pendingArticles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No submissions waiting for editorial review.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingArticles.map((article) => (
                                        <div
                                            key={article.id}
                                            className="rounded-lg border p-4 transition hover:bg-muted/20"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                                    {article.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Submitted by {article.author.name} ({article.author.department} · {article.author.role})
                                                </span>
                                            </div>

                                            <h3 className="mt-2 text-base font-bold">{article.title}</h3>
                                            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                                                {article.description}
                                            </p>

                                            <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                                                    onClick={() => {
                                                        setSelectedArticle(article);
                                                        setActionType('reject');
                                                    }}
                                                >
                                                    <X className="mr-1 h-3.5 w-3.5" />
                                                    Reject
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-xs"
                                                    onClick={() => {
                                                        setSelectedArticle(article);
                                                        setActionType('approve');
                                                    }}
                                                >
                                                    <Check className="mr-1 h-3.5 w-3.5" />
                                                    Approve & Assign
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Approved Articles with Analytics */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Approved Articles & Analytics ({approvedArticles.length})
                            </h2>

                            {approvedArticles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No approved articles yet.</p>
                            ) : (
                                <div className="divide-y text-sm">
                                    {approvedArticles.map((article) => (
                                        <div key={article.id} className="py-3 flex items-center justify-between gap-4">
                                            <div>
                                                <Link
                                                    href={`/newsletter/article/${article.id}`}
                                                    className="font-semibold hover:text-blue-600"
                                                >
                                                    {article.title}
                                                </Link>
                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                    {article.category} · Assigned to: {article.edition?.title ?? 'Unassigned'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                <Eye className="h-4 w-4" />
                                                {article.views_count} views
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Review Modal */}
                {selectedArticle && actionType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl border">
                            <h3 className="text-lg font-bold">
                                {actionType === 'approve' ? 'Approve Article' : 'Reject Article'}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground font-medium">
                                "{selectedArticle.title}"
                            </p>

                            {actionType === 'approve' && (
                                <div className="mt-4 space-y-2">
                                    <Label htmlFor="edition_select">Assign to Weekly Edition</Label>
                                    <select
                                        id="edition_select"
                                        className="w-full rounded-md border border-input bg-background p-2 text-sm"
                                        value={selectedEditionId}
                                        onChange={(e) => setSelectedEditionId(e.target.value)}
                                    >
                                        <option value="">-- Leave Unassigned for now --</option>
                                        {editions.map((ed) => (
                                            <option key={ed.id} value={ed.id}>
                                                Edition #{ed.edition_number}: {ed.title} ({ed.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mt-4 space-y-2">
                                <Label htmlFor="feedback">Editorial Notes / Feedback</Label>
                                <textarea
                                    id="feedback"
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background p-2 text-xs"
                                    placeholder={
                                        actionType === 'approve'
                                            ? 'Optional praise or scheduling note...'
                                            : 'Explain why this submission does not meet publication standards...'
                                    }
                                    value={adminFeedback}
                                    onChange={(e) => setAdminFeedback(e.target.value)}
                                />
                            </div>

                            <div className="mt-5 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedArticle(null);
                                        setActionType(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className={
                                        actionType === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }
                                    onClick={handleSubmissionDecision}
                                >
                                    Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

NewsletterAdmin.layout = {
    breadcrumbs: [
        { title: 'Weekly Newsletter', href: '/newsletter' },
        { title: 'Editorial Desk', href: '/newsletter/admin' },
    ],
};
