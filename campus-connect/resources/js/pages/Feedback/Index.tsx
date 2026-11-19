



import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

interface Feedback {
    id: number;
    user_id: number;
    category: string;
    rating: number;
    comment: string;
    is_anonymous: boolean;
    created_at: string;
    user: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    feedbacks: Feedback[];
    currentUserId: number;
    averageRating: number;
}

export default function FeedbackIndex({
    feedbacks,
    currentUserId,
    averageRating,
}: Props) {
    const [reportingId, setReportingId] = useState<number | null>(null);

    const feedbackForm = useForm({
        category: 'Course',
        rating: 5,
        comment: '',
        is_anonymous: false,
    });

    const reportForm = useForm({
        reason: 'Spam',
        details: '',
    });

    const submitFeedback = (e: React.FormEvent) => {
        e.preventDefault();

        feedbackForm.post('/feedback', {
            onSuccess: () => feedbackForm.reset(),
        });
    };

    const deleteFeedback = (id: number) => {
        if (confirm('Are you sure you want to delete this feedback?')) {
            router.delete(`/feedback/${id}`);
        }
    };

    const submitReport = (e: React.FormEvent, id: number) => {
        e.preventDefault();

        reportForm.post(`/feedback/${id}/report`, {
            onSuccess: () => {
                setReportingId(null);
                reportForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Feedback and Rating" />

            <div className="min-h-screen bg-gray-100 px-4 py-10">
                <div className="mx-auto max-w-4xl space-y-8">

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Feedback and Rating
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Share your feedback and help improve our campus.
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Average Rating
                        </h2>
                        <p className="mt-2 text-3xl font-bold text-yellow-500">
                            {Number(averageRating).toFixed(1)} / 5 ★
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">
                            Submit Your Feedback
                        </h2>

                        <form onSubmit={submitFeedback} className="space-y-4">

                            <div>
                                <label className="mb-1 block font-medium">
                                    Category
                                </label>
                                <select
                                    value={feedbackForm.data.category}
                                    onChange={(e) =>
                                        feedbackForm.setData('category', e.target.value)
                                    }
                                    className="w-full rounded-md border p-2"
                                >
                                    <option value="Course">Course</option>
                                    <option value="Facility">Facility</option>
                                    <option value="Service">Service</option>
                                </select>
                                {feedbackForm.errors.category && (
                                    <p className="text-sm text-red-600">
                                        {feedbackForm.errors.category}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Rating
                                </label>
                                <select
                                    value={feedbackForm.data.rating}
                                    onChange={(e) =>
                                        feedbackForm.setData('rating', Number(e.target.value))
                                    }
                                    className="w-full rounded-md border p-2"
                                >
                                    <option value={5}>5 - Excellent</option>
                                    <option value={4}>4 - Very Good</option>
                                    <option value={3}>3 - Good</option>
                                    <option value={2}>2 - Fair</option>
                                    <option value={1}>1 - Poor</option>
                                </select>
                                {feedbackForm.errors.rating && (
                                    <p className="text-sm text-red-600">
                                        {feedbackForm.errors.rating}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Comment
                                </label>
                                <textarea
                                    value={feedbackForm.data.comment}
                                    onChange={(e) =>
                                        feedbackForm.setData('comment', e.target.value)
                                    }
                                    rows={4}
                                    placeholder="Write your feedback..."
                                    className="w-full rounded-md border p-2"
                                />
                                {feedbackForm.errors.comment && (
                                    <p className="text-sm text-red-600">
                                        {feedbackForm.errors.comment}
                                    </p>
                                )}
                            </div>

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={feedbackForm.data.is_anonymous}
                                    onChange={(e) =>
                                        feedbackForm.setData('is_anonymous', e.target.checked)
                                    }
                                />
                                Submit anonymously
                            </label>

                            <button
                                type="submit"
                                disabled={feedbackForm.processing}
                                className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {feedbackForm.processing ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-5 text-xl font-semibold">
                            Student Feedback
                        </h2>

                        {feedbacks.length === 0 ? (
                            <p className="text-gray-500">
                                No feedback submitted yet.
                            </p>
                        ) : (
                            <div className="space-y-5">
                                {feedbacks.map((feedback) => (
                                    <div
                                        key={feedback.id}
                                        className="rounded-lg border p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <p className="font-semibold">
                                                    {feedback.is_anonymous
                                                        ? 'Anonymous Student'
                                                        : feedback.user?.name ?? 'Student'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {feedback.category}
                                                </p>
                                            </div>

                                            <p className="font-semibold text-yellow-500">
                                                {'★'.repeat(feedback.rating)}
                                                {'☆'.repeat(5 - feedback.rating)}
                                            </p>
                                        </div>

                                        <p className="mt-3 whitespace-pre-wrap text-gray-700">
                                            {feedback.comment}
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            {new Date(feedback.created_at).toLocaleDateString()}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {feedback.user_id === currentUserId ? (
                                                <button
                                                    type="button"
                                                    onClick={() => deleteFeedback(feedback.id)}
                                                    className="text-sm font-medium text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setReportingId(
                                                            reportingId === feedback.id
                                                                ? null
                                                                : feedback.id
                                                        );
                                                        reportForm.reset();
                                                    }}
                                                    className="text-sm font-medium text-red-600 hover:underline"
                                                >
                                                    Report Abuse / Spam
                                                </button>
                                            )}
                                        </div>

                                        {reportingId === feedback.id && (
                                            <form
                                                onSubmit={(e) => submitReport(e, feedback.id)}
                                                className="mt-4 space-y-3 rounded-md bg-gray-50 p-4"
                                            >
                                                <h3 className="font-semibold">
                                                    Report this feedback
                                                </h3>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium">
                                                        Reason
                                                    </label>
                                                    <select
                                                        value={reportForm.data.reason}
                                                        onChange={(e) =>
                                                            reportForm.setData('reason', e.target.value)
                                                        }
                                                        className="w-full rounded-md border p-2"
                                                    >
                                                        <option value="Abuse">Abuse</option>
                                                        <option value="Spam">Spam</option>
                                                        <option value="Inappropriate Content">
                                                            Inappropriate Content
                                                        </option>
                                                    </select>
                                                    {reportForm.errors.reason && (
                                                        <p className="text-sm text-red-600">
                                                            {reportForm.errors.reason}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-1 block text-sm font-medium">
                                                        Additional Details (Optional)
                                                    </label>
                                                    <textarea
                                                        value={reportForm.data.details}
                                                        onChange={(e) =>
                                                            reportForm.setData('details', e.target.value)
                                                        }
                                                        rows={3}
                                                        className="w-full rounded-md border p-2"
                                                        placeholder="Explain why you are reporting..."
                                                    />
                                                    {reportForm.errors.details && (
                                                        <p className="text-sm text-red-600">
                                                            {reportForm.errors.details}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="submit"
                                                    disabled={reportForm.processing}
                                                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    {reportForm.processing
                                                        ? 'Submitting...'
                                                        : 'Submit Report'}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
