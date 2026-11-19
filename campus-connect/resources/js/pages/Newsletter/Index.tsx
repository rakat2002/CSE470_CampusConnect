import { Head, Link, router } from '@inertiajs/react';
import { Bookmark, BookmarkCheck, Calendar, Eye, Filter, Newspaper, PlusCircle, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ArticleItem {
    id: number;
    title: string;
    description: string;
    category: string;
    cover_image: string | null;
    relevant_links: string | null;
    event_link: string | null;
    status: string;
    admin_feedback: string | null;
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
    articles: ArticleItem[];
    latestEdition: EditionItem | null;
    currentEdition: EditionItem | null;
    editions: EditionItem[];
    categories: string[];
    filters: {
        category?: string;
        search?: string;
        tab?: string;
        edition_id?: number | string;
    };
    isAdmin: boolean;
}

export default function NewsletterIndex({
    articles,
    latestEdition,
    currentEdition,
    editions,
    categories,
    filters,
    isAdmin,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const currentTab = filters.tab ?? 'latest';
    const activeCategory = filters.category ?? '';

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/newsletter',
            {
                search,
                category: activeCategory,
                tab: currentTab,
                edition_id: filters.edition_id,
            },
            { preserveState: true }
        );
    }

    function selectCategory(cat: string) {
        router.get(
            '/newsletter',
            {
                search,
                category: cat === activeCategory ? '' : cat,
                tab: currentTab,
                edition_id: filters.edition_id,
            },
            { preserveState: true }
        );
    }

    function switchTab(newTab: string, editionId?: number) {
        router.get('/newsletter', {
            tab: newTab,
            edition_id: editionId,
        });
    }

    function toggleBookmark(articleId: number) {
        router.post(`/newsletter/article/${articleId}/bookmark`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Campus Weekly Newsletter" />

            <div className="mx-auto max-w-7xl p-6">
                {/* Header Banner */}
                <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                                <Newspaper className="h-3.5 w-3.5" />
                                Official Weekly Edition
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                                {currentEdition ? currentEdition.title : 'Campus Weekly Newsletter'}
                            </h1>
                            <p className="mt-2 max-w-2xl text-blue-100">
                                {currentEdition?.summary ||
                                    'Stay informed with the latest university announcements, club achievements, student opportunities, and academic updates.'}
                            </p>
                            {currentEdition && (
                                <p className="mt-2 text-xs text-blue-200">
                                    Issue #{currentEdition.edition_number} · Published on {currentEdition.published_at ?? 'This Week'}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link href="/newsletter/submit">
                                <Button className="bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-md">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Submit Article
                                </Button>
                            </Link>

                            {isAdmin && (
                                <Link href="/newsletter/admin">
                                    <Button variant="secondary" className="bg-amber-400 text-amber-950 hover:bg-amber-300 font-semibold shadow-md">
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Editorial Desk
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs & Controls */}
                <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={currentTab === 'latest' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('latest')}
                        >
                            Current Edition
                        </Button>
                        <Button
                            variant={currentTab === 'archive' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('archive')}
                        >
                            Past Editions ({editions.length})
                        </Button>
                        <Button
                            variant={currentTab === 'bookmarks' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('bookmarks')}
                        >
                            <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                            My Bookmarks
                        </Button>
                        <Button
                            variant={currentTab === 'my_submissions' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => switchTab('my_submissions')}
                        >
                            My Submissions
                        </Button>
                    </div>

                    {currentTab !== 'archive' && (
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search news & articles..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" size="sm" variant="secondary">
                                Search
                            </Button>
                        </form>
                    )}
                </div>

                {/* Category Pills (for article lists) */}
                {currentTab !== 'archive' && (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground flex items-center mr-1">
                            <Filter className="mr-1 h-3 w-3" /> Categories:
                        </span>
                        <button
                            type="button"
                            onClick={() => selectCategory('')}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                activeCategory === ''
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => selectCategory(cat)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                    activeCategory === cat
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* TAB CONTENT 1: Past Editions Archive */}
                {currentTab === 'archive' && (
                    <div>
                        <h2 className="mb-4 text-xl font-bold">Past Weekly Editions</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {editions.map((edition) => (
                                <div
                                    key={edition.id}
                                    className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                                >
                                    <div>
                                        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800">
                                                Edition #{edition.edition_number}
                                            </span>
                                            <span>{edition.published_at ?? 'Recent'}</span>
                                        </div>
                                        <h3 className="text-lg font-bold">{edition.title}</h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {edition.summary || 'Weekly compilation of campus updates and highlights.'}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                                        <span className="text-xs text-muted-foreground">
                                            {edition.articles_count} published article{edition.articles_count === 1 ? '' : 's'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => switchTab('latest', edition.id)}
                                        >
                                            View Edition
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB CONTENT 2: Articles Grid (Latest, Bookmarks, My Submissions) */}
                {currentTab !== 'archive' && (
                    <>
                        {articles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                                <Newspaper className="mb-3 h-12 w-12 text-muted-foreground/60" />
                                <h3 className="text-lg font-semibold">No articles found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {currentTab === 'bookmarks'
                                        ? 'You have not bookmarked any newsletter articles yet.'
                                        : currentTab === 'my_submissions'
                                        ? 'You have not submitted any article proposals yet.'
                                        : 'No articles match the chosen category or search criteria.'}
                                </p>
                                <Link href="/newsletter/submit" className="mt-4">
                                    <Button size="sm">Submit an Article</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {articles.map((article) => (
                                    <div
                                        key={article.id}
                                        className="flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div>
                                            {/* Cover Header */}
                                            {article.cover_image ? (
                                                <div className="relative h-48 w-full overflow-hidden bg-muted">
                                                    <img
                                                        src={article.cover_image}
                                                        alt={article.title}
                                                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                                    />
                                                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                                        {article.category}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex h-32 w-full items-center justify-between bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                                                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                                                        {article.category}
                                                    </span>
                                                    <Newspaper className="h-8 w-8 text-white/30" />
                                                </div>
                                            )}

                                            <div className="p-5">
                                                {/* Status badge for my_submissions */}
                                                {currentTab === 'my_submissions' && (
                                                    <div className="mb-2">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                article.status === 'approved'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : article.status === 'rejected'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}
                                                        >
                                                            {article.status.toUpperCase()}
                                                        </span>
                                                        {article.admin_feedback && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                Admin Note: {article.admin_feedback}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                <h3 className="line-clamp-2 text-lg font-bold tracking-tight">
                                                    <Link
                                                        href={`/newsletter/article/${article.id}`}
                                                        className="hover:text-blue-600"
                                                    >
                                                        {article.title}
                                                    </Link>
                                                </h3>

                                                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                                    {article.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="border-t p-4 pt-3">
                                            <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                                                <div>
                                                    <span className="font-medium text-foreground">
                                                        {article.author.name}
                                                    </span>{' '}
                                                    ({article.author.department})
                                                </div>
                                                <span>{article.published_at}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        {article.views_count}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => toggleBookmark(article.id)}
                                                        title={article.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                                                    >
                                                        {article.is_bookmarked ? (
                                                            <BookmarkCheck className="h-4 w-4 text-blue-600" />
                                                        ) : (
                                                            <Bookmark className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>

                                                    <Link href={`/newsletter/article/${article.id}`}>
                                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                                            Read More
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

NewsletterIndex.layout = {
    breadcrumbs: [{ title: 'Weekly Newsletter', href: '/newsletter' }],
};
