import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { PageError, ResourceHubNav, useReport } from '@/components/resource-hub-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StudyResource {
    id: number;
    user_id: number;
    title: string;
    course_code: string;
    topic: string;
    description: string | null;
    original_name: string;
    file_type: string;
    file_size_kb: number;
    is_hidden: boolean;
    created_at: string;
    user: {
        name: string;
        department: string;
    };
}

interface Props {
    resources: StudyResource[];
    filters: { search: string };
    currentUserId: number;
    isAdmin: boolean;
}

const textareaClass = 'w-full rounded-md border border-input bg-white p-2 text-sm text-black';
const errorClass = 'text-sm text-red-500';

function formatSize(kb: number) {
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export default function Resources({ resources, filters, currentUserId, isAdmin }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { report, isReported } = useReport();

    const uploadForm = useForm<{
        title: string;
        course_code: string;
        topic: string;
        description: string;
        file: File | null;
    }>({
        title: '',
        course_code: '',
        topic: '',
        description: '',
        file: null,
    });

    const editForm = useForm({ title: '', course_code: '', topic: '', description: '' });

    function upload(e: FormEvent) {
        e.preventDefault();
        uploadForm.post('/resources', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                uploadForm.reset();
                (document.getElementById('resource-file') as HTMLInputElement).value = '';
            },
        });
    }

    function runSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/resources', search ? { search } : {}, { preserveState: true, preserveScroll: true });
    }

    function startEdit(resource: StudyResource) {
        setEditingId(resource.id);
        editForm.setData({
            title: resource.title,
            course_code: resource.course_code,
            topic: resource.topic,
            description: resource.description ?? '',
        });
    }

    function saveEdit(e: FormEvent) {
        e.preventDefault();
        editForm.patch(`/resources/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    }

    function remove(id: number) {
        if (!window.confirm('Delete this resource?')) return;
        router.delete(`/resources/${id}`, { preserveScroll: true });
    }

    function toggleHidden(id: number) {
        router.patch(`/resources/${id}/toggle-hidden`, {}, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Study Resources" />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Academic Resource and Help Hub</h1>
                <ResourceHubNav active="resources" isAdmin={isAdmin} />
                <PageError keys={['report']} />

                {/* UPLOAD */}
                <section className="mb-8 rounded-lg border p-5">
                    <h2 className="mb-4 text-xl font-semibold">Share a Study Resource</h2>

                    <form onSubmit={upload} className="grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-3">
                            <Input
                                placeholder="Title, e.g. CSE470 Midterm Notes"
                                value={uploadForm.data.title}
                                onChange={(e) => uploadForm.setData('title', e.target.value)}
                            />
                            {uploadForm.errors.title && <p className={errorClass}>{uploadForm.errors.title}</p>}
                        </div>

                        <div>
                            <Input
                                placeholder="Course code, e.g. CSE470"
                                value={uploadForm.data.course_code}
                                onChange={(e) => uploadForm.setData('course_code', e.target.value)}
                            />
                            {uploadForm.errors.course_code && <p className={errorClass}>{uploadForm.errors.course_code}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <Input
                                placeholder="Topic, e.g. UML class diagrams"
                                value={uploadForm.data.topic}
                                onChange={(e) => uploadForm.setData('topic', e.target.value)}
                            />
                            {uploadForm.errors.topic && <p className={errorClass}>{uploadForm.errors.topic}</p>}
                        </div>

                        <textarea
                            className={textareaClass + ' md:col-span-3'}
                            rows={2}
                            placeholder="Short description (optional)"
                            value={uploadForm.data.description}
                            onChange={(e) => uploadForm.setData('description', e.target.value)}
                        />

                        <div className="md:col-span-3">
                            <label className="text-sm">
                                File (PDF, DOCX, PPTX, JPG, PNG, max 10 MB)
                                <input
                                    id="resource-file"
                                    type="file"
                                    accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
                                    className="mt-1 block text-sm"
                                    onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                />
                            </label>
                            {uploadForm.errors.file && <p className={errorClass}>{uploadForm.errors.file}</p>}
                        </div>

                        <div>
                            <Button type="submit" disabled={uploadForm.processing}>
                                {uploadForm.processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* SEARCH */}
                <form onSubmit={runSearch} className="mb-4 flex flex-wrap gap-2">
                    <Input
                        className="max-w-md"
                        placeholder="Search by title, course code or topic"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit">Search</Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            router.get('/resources');
                        }}
                    >
                        Clear
                    </Button>
                </form>

                {/* LIST */}
                {resources.length === 0 ? (
                    <p className="py-6 text-center text-gray-500">No resources found.</p>
                ) : (
                    <div className="grid gap-4">
                        {resources.map((resource) => {
                            const isOwner = resource.user_id === currentUserId;

                            return (
                                <div key={resource.id} className="rounded-lg border p-5">
                                    {editingId === resource.id ? (
                                        <form onSubmit={saveEdit} className="grid gap-3">
                                            <Input
                                                value={editForm.data.title}
                                                onChange={(e) => editForm.setData('title', e.target.value)}
                                            />
                                            {editForm.errors.title && <p className={errorClass}>{editForm.errors.title}</p>}
                                            <div className="flex flex-wrap gap-2">
                                                <Input
                                                    className="max-w-40"
                                                    value={editForm.data.course_code}
                                                    onChange={(e) => editForm.setData('course_code', e.target.value)}
                                                />
                                                <Input
                                                    className="max-w-md"
                                                    value={editForm.data.topic}
                                                    onChange={(e) => editForm.setData('topic', e.target.value)}
                                                />
                                            </div>
                                            {editForm.errors.course_code && <p className={errorClass}>{editForm.errors.course_code}</p>}
                                            {editForm.errors.topic && <p className={errorClass}>{editForm.errors.topic}</p>}
                                            <textarea
                                                className={textareaClass}
                                                rows={2}
                                                value={editForm.data.description}
                                                onChange={(e) => editForm.setData('description', e.target.value)}
                                            />
                                            <div className="flex gap-2">
                                                <Button type="submit" disabled={editForm.processing}>Save</Button>
                                                <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {resource.title}
                                                        {resource.is_hidden && (
                                                            <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                                                Hidden by admin
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {resource.course_code} · {resource.topic}
                                                    </p>
                                                </div>

                                                <Button asChild>
                                                    <a href={`/resources/${resource.id}/download`}>Download</a>
                                                </Button>
                                            </div>

                                            {resource.description && <p className="mt-2 text-sm">{resource.description}</p>}

                                            <p className="mt-2 text-xs text-gray-500">
                                                {resource.file_type.toUpperCase()} · {formatSize(resource.file_size_kb)} · shared by{' '}
                                                {resource.user?.name} ({resource.user?.department}) ·{' '}
                                                {new Date(resource.created_at).toLocaleDateString()}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {isOwner && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => startEdit(resource)}>
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => remove(resource.id)}>
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}

                                                {!isOwner && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={isReported('resource', resource.id)}
                                                        onClick={() => report('resource', resource.id)}
                                                    >
                                                        {isReported('resource', resource.id) ? 'Reported' : 'Report'}
                                                    </Button>
                                                )}

                                                {isAdmin && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => toggleHidden(resource.id)}>
                                                            {resource.is_hidden ? 'Unhide' : 'Hide'}
                                                        </Button>
                                                        {!isOwner && (
                                                            <Button size="sm" variant="destructive" onClick={() => remove(resource.id)}>
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

Resources.layout = {
    breadcrumbs: [{ title: 'Resource Hub', href: '/resources' }],
};
