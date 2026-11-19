


import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

type PlannerItem = {
    id: number;
    type: 'note' | 'task';
    title: string;
    description: string | null;
    course_code: string | null;
    priority: 'low' | 'medium' | 'high' | null;
    due_date: string | null;
    is_completed: boolean;
};

export default function Index({ items }: { items: PlannerItem[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const { data, setData, post, put, processing, reset } = useForm({
        type: 'note' as 'note' | 'task',
        title: '',
        description: '',
        course_code: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        due_date: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editingId !== null) {
            put(`/study-planner/${editingId}`, {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                },
            });
        } else {
            post('/study-planner', {
                onSuccess: () => reset(),
            });
        }
    }

    function editItem(item: PlannerItem) {
        setEditingId(item.id);
        setData({
            type: item.type,
            title: item.title,
            description: item.description ?? '',
            course_code: item.course_code ?? '',
            priority: item.priority ?? 'medium',
            due_date: item.due_date ?? '',
        });
    }

    function cancelEdit() {
        reset();
        setEditingId(null);
    }

    function deleteItem(id: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(`/study-planner/${id}`);
        }
    }

    function toggleTask(item: PlannerItem) {
        router.put(`/study-planner/${item.id}`, {
            title: item.title,
            description: item.description ?? '',
            course_code: item.course_code ?? '',
            priority: item.priority,
            due_date: item.due_date,
            is_completed: !item.is_completed,
        });
    }

    const filteredItems = items.filter((item) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            item.title.toLowerCase().includes(searchText) ||
            (item.course_code ?? '').toLowerCase().includes(searchText) ||
            (item.description ?? '').toLowerCase().includes(searchText);

        const matchesType =
            filterType === 'all' || item.type === filterType;

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'completed' && item.is_completed) ||
            (filterStatus === 'pending' && !item.is_completed);

        return matchesSearch && matchesType && matchesStatus;
    });

    return (
        <>
            <Head title="Personal Study Planner" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-4xl">
                    <h1 className="mb-2 text-3xl font-bold text-gray-800">
                        Personal Study Planner
                    </h1>

                    <p className="mb-6 text-gray-600">
                        Organize your notes and academic tasks.
                    </p>

                    <form onSubmit={submit} className="mb-8 space-y-4 rounded-xl bg-white p-6 shadow">
                        <h2 className="text-xl font-semibold">
                            {editingId !== null ? 'Edit Item' : 'Add New Item'}
                        </h2>

                        <select
                            value={data.type}
                            disabled={editingId !== null}
                            onChange={(e) => setData('type', e.target.value as 'note' | 'task')}
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="note">Personal Note</option>
                            <option value="task">To-Do Task</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-lg border p-3"
                            required
                        />

                        <input
                            type="text"
                            placeholder="Course Code (optional)"
                            value={data.course_code}
                            onChange={(e) => setData('course_code', e.target.value)}
                            className="w-full rounded-lg border p-3"
                        />

                        <textarea
                            placeholder="Description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-lg border p-3"
                            rows={3}
                        />

                        {data.type === 'task' && (
                            <>
                                <select
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value as 'low' | 'medium' | 'high')}
                                    className="w-full rounded-lg border p-3"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>

                                <input
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    className="w-full rounded-lg border p-3"
                                />
                            </>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Saving...'
                                    : editingId !== null
                                        ? 'Save Changes'
                                        : 'Add Item'}
                            </button>

                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="rounded-lg bg-gray-300 px-6 py-3 text-gray-800 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                        My Notes & Tasks
                    </h2>

                    {/* Search and Filters */}
                    <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl bg-white p-5 shadow md:grid-cols-3">
                        <input
                            type="text"
                            placeholder="Search title, course or description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg border p-3 md:col-span-3"
                        />

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="rounded-lg border p-3"
                        >
                            <option value="all">All Items</option>
                            <option value="note">Notes Only</option>
                            <option value="task">Tasks Only</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-lg border p-3"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending Tasks</option>
                            <option value="completed">Completed Tasks</option>
                        </select>

                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setFilterType('all');
                                setFilterStatus('all');
                            }}
                            className="rounded-lg bg-gray-200 p-3 text-gray-700 hover:bg-gray-300"
                        >
                            Clear Filters
                        </button>
                    </div>

                    <p className="mb-4 text-sm text-gray-500">
                        Showing {filteredItems.length} of {items.length} items
                    </p>

                    <div className="space-y-4">
                        {filteredItems.length === 0 && (
                            <p className="rounded-lg bg-white p-6 text-gray-500">
                                No matching notes or tasks found.
                            </p>
                        )}

                        {filteredItems.map((item) => (
                            <div key={item.id} className="rounded-xl bg-white p-5 shadow">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                        {item.type === 'note' ? 'Note' : 'Task'}
                                    </span>

                                    {item.type === 'task' && (
                                        <label className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={item.is_completed}
                                                onChange={() => toggleTask(item)}
                                            />
                                            Completed
                                        </label>
                                    )}
                                </div>

                                <h3 className={`mt-3 text-lg font-bold ${item.is_completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {item.title}
                                </h3>

                                {item.course_code && (
                                    <p className="text-sm text-gray-500">
                                        Course: {item.course_code}
                                    </p>
                                )}

                                {item.description && (
                                    <p className="mt-2 text-gray-700">{item.description}</p>
                                )}

                                {item.type === 'task' && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Priority: {item.priority ?? 'Not set'} |
                                        Due: {item.due_date ?? 'No deadline'}
                                    </p>
                                )}

                                <div className="mt-4 flex gap-4">
                                    <button
                                        onClick={() => editItem(item)}
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-sm font-medium text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
