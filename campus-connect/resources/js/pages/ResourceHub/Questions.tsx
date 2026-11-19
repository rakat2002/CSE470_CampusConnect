import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ResourceHubNav } from '@/components/resource-hub-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Question {
    id: number;
    title: string;
    course_code: string;
    topic: string | null;
    status: string;
    is_hidden: boolean;
    replies_count: number;
    created_at: string;
    user: {
        name: string;
    };
}

interface Props {
    questions: Question[];
    filters: { search: string; status: string };
    isAdmin: boolean;
}

const selectClass = 'h-9 rounded-md border border-input bg-white px-3 text-sm text-black';
const textareaClass = 'w-full rounded-md border border-input bg-white p-2 text-sm text-black';
const errorClass = 'text-sm text-red-500';

export default function Questions({ questions, filters, isAdmin }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [status, setStatus] = useState(filters.status);

    const askForm = useForm({ title: '', details: '', course_code: '', topic: '' });

    function ask(e: FormEvent) {
        e.preventDefault();
        askForm.post('/questions');
    }

    function runSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/questions', { search, status }, { preserveState: true, preserveScroll: true });
    }

    return (
        <>
            <Head title="Q&A Help" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Academic Resource and Help Hub</h1>
                <ResourceHubNav active="questions" isAdmin={isAdmin} />

                {/* ASK */}
                <section className="mb-8 rounded-lg border p-5">
                    <h2 className="mb-4 text-xl font-semibold">Ask a Question</h2>

                    <form onSubmit={ask} className="grid gap-3">
                        <Input
                            placeholder="Question title, e.g. How do I show composition in a class diagram?"
                            value={askForm.data.title}
                            onChange={(e) => askForm.setData('title', e.target.value)}
                        />
                        {askForm.errors.title && <p className={errorClass}>{askForm.errors.title}</p>}

                        <textarea
                            className={textareaClass}
                            rows={3}
                            placeholder="Explain your question in detail"
                            value={askForm.data.details}
                            onChange={(e) => askForm.setData('details', e.target.value)}
                        />
                        {askForm.errors.details && <p className={errorClass}>{askForm.errors.details}</p>}

                        <div className="flex flex-wrap gap-2">
                            <div>
                                <Input
                                    placeholder="Course code, e.g. CSE470"
                                    value={askForm.data.course_code}
                                    onChange={(e) => askForm.setData('course_code', e.target.value)}
                                />
                                {askForm.errors.course_code && <p className={errorClass}>{askForm.errors.course_code}</p>}
                            </div>
                            <Input
                                className="max-w-md"
                                placeholder="Topic (optional)"
                                value={askForm.data.topic}
                                onChange={(e) => askForm.setData('topic', e.target.value)}
                            />
                        </div>

                        <div>
                            <Button type="submit" disabled={askForm.processing}>Post Question</Button>
                        </div>
                    </form>
                </section>

                {/* SEARCH */}
                <form onSubmit={runSearch} className="mb-4 flex flex-wrap gap-2">
                    <Input
                        className="max-w-md"
                        placeholder="Search by title, course code, topic or text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All questions</option>
                        <option value="open">Open</option>
                        <option value="answered">Answered</option>
                    </select>
                    <Button type="submit">Search</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            router.get('/questions');
                        }}
                    >
                        Clear
                    </Button>
                </form>

                {/* LIST */}
                {questions.length === 0 ? (
                    <p className="py-6 text-center text-gray-500">No questions found.</p>
                ) : (
                    <div className="grid gap-3">
                        {questions.map((question) => (
                            <Link
                                key={question.id}
                                href={`/questions/${question.id}`}
                                className="block rounded-lg border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold">{question.title}</h3>
                                    <span
                                        className={`rounded px-2 py-0.5 text-xs ${
                                            question.status === 'answered'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {question.status === 'answered' ? 'Answered' : 'Open'}
                                    </span>
                                    {question.is_hidden && (
                                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Hidden by admin</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {question.course_code}
                                    {question.topic ? ` · ${question.topic}` : ''} · {question.replies_count}{' '}
                                    {question.replies_count === 1 ? 'reply' : 'replies'} · asked by {question.user?.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Questions.layout = {
    breadcrumbs: [{ title: 'Q&A Help', href: '/questions' }],
};
