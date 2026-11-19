import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PageError, ResourceHubNav, useReport } from '@/components/resource-hub-nav';
import { Button } from '@/components/ui/button';

interface Reply {
    id: number;
    user_id: number;
    content: string;
    is_accepted: boolean;
    is_hidden: boolean;
    created_at: string;
    user: {
        name: string;
        department: string;
    };
}

interface Props {
    question: {
        id: number;
        user_id: number;
        title: string;
        details: string;
        course_code: string;
        topic: string | null;
        status: string;
        is_hidden: boolean;
        created_at: string;
        user: {
            name: string;
            department: string;
        };
        replies: Reply[];
    };
    currentUserId: number;
    isOwner: boolean;
    isAdmin: boolean;
}

const textareaClass = 'w-full rounded-md border border-input bg-white p-2 text-sm text-black';

export default function QuestionShow({ question, currentUserId, isOwner, isAdmin }: Props) {
    const { report, isReported } = useReport();
    const replyForm = useForm({ content: '' });

    const hasAccepted = question.replies.some((reply) => reply.is_accepted);

    function sendReply(e: FormEvent) {
        e.preventDefault();
        replyForm.post(`/questions/${question.id}/replies`, {
            preserveScroll: true,
            onSuccess: () => replyForm.reset(),
        });
    }

    function accept(replyId: number) {
        if (!window.confirm('Mark this reply as the accepted answer? This cannot be changed.')) return;
        router.patch(`/replies/${replyId}/accept`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title={question.title} />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Academic Resource and Help Hub</h1>
                <ResourceHubNav active="questions" isAdmin={isAdmin} />
                <PageError keys={['answer', 'report']} />

                <Link href="/questions" className="mb-4 inline-block text-sm text-blue-500 underline">
                    ← Back to all questions
                </Link>

                {/* QUESTION */}
                <section className="mb-6 rounded-lg border p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold">{question.title}</h2>
                        <span
                            className={`rounded px-2 py-0.5 text-xs ${
                                question.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
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
                        {question.topic ? ` · ${question.topic}` : ''} · asked by {question.user?.name} (
                        {question.user?.department}) · {new Date(question.created_at).toLocaleDateString()}
                    </p>

                    <p className="mt-3 whitespace-pre-line">{question.details}</p>

                    <div className="mt-3 flex gap-2">
                        {!isOwner && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isReported('question', question.id)}
                                onClick={() => report('question', question.id)}
                            >
                                {isReported('question', question.id) ? 'Reported' : 'Report'}
                            </Button>
                        )}
                        {isAdmin && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    router.patch(`/questions/${question.id}/toggle-hidden`, {}, { preserveScroll: true })
                                }
                            >
                                {question.is_hidden ? 'Unhide question' : 'Hide question'}
                            </Button>
                        )}
                    </div>
                </section>

                {/* REPLIES */}
                <h3 className="mb-3 text-lg font-semibold">
                    {question.replies.length} {question.replies.length === 1 ? 'Reply' : 'Replies'}
                </h3>

                <div className="mb-6 grid gap-3">
                    {question.replies.map((reply) => {
                        const isMyReply = reply.user_id === currentUserId;

                        return (
                            <div
                                key={reply.id}
                                className={`rounded-lg border p-4 ${reply.is_accepted ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
                            >
                                {reply.is_accepted && (
                                    <p className="mb-1 text-sm font-semibold text-green-700">✓ Accepted answer</p>
                                )}
                                {reply.is_hidden && (
                                    <p className="mb-1 text-xs text-red-700">Hidden by admin</p>
                                )}

                                <p className="whitespace-pre-line">{reply.content}</p>
                                <p className="mt-2 text-xs text-gray-500">
                                    {reply.user?.name} ({reply.user?.department}) · {new Date(reply.created_at).toLocaleDateString()}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">
                                    {/* Only the question creator, only once, never their own reply */}
                                    {isOwner && !hasAccepted && !isMyReply && !reply.is_hidden && (
                                        <Button size="sm" onClick={() => accept(reply.id)}>
                                            Accept as answer
                                        </Button>
                                    )}

                                    {!isMyReply && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isReported('reply', reply.id)}
                                            onClick={() => report('reply', reply.id)}
                                        >
                                            {isReported('reply', reply.id) ? 'Reported' : 'Report'}
                                        </Button>
                                    )}

                                    {isAdmin && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                router.patch(`/replies/${reply.id}/toggle-hidden`, {}, { preserveScroll: true })
                                            }
                                        >
                                            {reply.is_hidden ? 'Unhide' : 'Hide'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* WRITE A REPLY */}
                {!question.is_hidden && (
                    <form onSubmit={sendReply} className="grid gap-3 rounded-lg border p-5">
                        <h3 className="font-semibold">Your Reply</h3>
                        <textarea
                            className={textareaClass}
                            rows={4}
                            placeholder="Write a helpful answer..."
                            value={replyForm.data.content}
                            onChange={(e) => replyForm.setData('content', e.target.value)}
                        />
                        {replyForm.errors.content && <p className="text-sm text-red-500">{replyForm.errors.content}</p>}
                        <div>
                            <Button type="submit" disabled={replyForm.processing}>Post Reply</Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

QuestionShow.layout = {
    breadcrumbs: [{ title: 'Q&A Help', href: '/questions' }],
};
