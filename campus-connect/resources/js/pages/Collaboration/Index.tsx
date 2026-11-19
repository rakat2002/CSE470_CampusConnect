
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';

interface CollaborationRequest {
    id: number;
    user_id: number;
    message: string | null;
    status: string;
    user: {
        name: string;
    };
}

interface CollaborationInvitation {
    id: number;
    user_id: number;
    status: string;
    user?: {
        name: string;
        student_id?: string;
    };
    collaboration_post?: {
        id: number;
        title: string;
        activity_type: string;
        user: {
            name: string;
        };
    };
}

interface CollaborationPost {
    id: number;
    user_id: number;
    title: string;
    description: string;
    activity_type: string;
    required_skills: string;
    department: string;
    course_code: string | null;
    section: string | null;
    teammates_needed: number;
    status: string;
    created_at: string;
    user: {
        name: string;
    };
    collaboration_requests: CollaborationRequest[];
    accepted_requests: CollaborationRequest[];
    invitations: CollaborationInvitation[];
}

interface Props {
    posts: CollaborationPost[];
    currentUserId: number;
    myInvitations: CollaborationInvitation[];
}

const activityTypes = [
    'Assignment',
    'Course Project',
    'Thesis / Research',
    'Research Paper Writing',
    'Case Study',
    'Hackathon / Competition',
    'Personal Project',
    'Extracurricular / Club Project',
    'Other',
];

const departments = [
    'CSE',
    'CS',
    'EEE',
    'BBA',
    'Economics',
    'English',
    'Architecture',
    'Pharmacy',
    'Other',
];

export default function Index({ posts, currentUserId, myInvitations }: Props) {
    const pageErrors = usePage().props.errors as Record<string, string>;
    const [activityFilter, setActivityFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [requestMessages, setRequestMessages] = useState<Record<number, string>>({});
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [inviteStudentIds, setInviteStudentIds] = useState<Record<number, string>>({});

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        activity_type: 'Course Project',
        required_skills: '',
        department: 'CSE',
        course_code: '',
        section: '',
        teammates_needed: 1,
    });

    const editForm = useForm({
        title: '',
        description: '',
        activity_type: 'Course Project',
        required_skills: '',
        department: 'CSE',
        course_code: '',
        section: '',
        teammates_needed: 1,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        post('/collaboration', {
            onSuccess: () => reset(),
        });
    }

    function startEditing(post: CollaborationPost) {
        setEditingPostId(post.id);

        editForm.setData({
            title: post.title,
            description: post.description,
            activity_type: post.activity_type,
            required_skills: post.required_skills,
            department: post.department,
            course_code: post.course_code || '',
            section: post.section || '',
            teammates_needed: post.teammates_needed,
        });
    }

    function cancelEditing() {
        setEditingPostId(null);
        editForm.reset();
        editForm.clearErrors();
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();

        if (editingPostId === null) return;

        editForm.patch(`/collaboration/${editingPostId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPostId(null);
                editForm.reset();
            },
        });
    }

    function closePost(postId: number) {
        const confirmed = window.confirm(
            'Are you sure you want to close this collaboration post? Other students will no longer be able to find or request to join it.'
        );

        if (!confirmed) return;

        router.patch(
            `/collaboration/${postId}/close`,
            {},
            { preserveScroll: true }
        );
    }

    function sendCollaborationRequest(postId: number) {
        router.post(
            `/collaboration/${postId}/requests`,
            { message: requestMessages[postId] || '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRequestMessages((previous) => ({
                        ...previous,
                        [postId]: '',
                    }));
                },
            }
        );
    }

    function updateRequestStatus(
        requestId: number,
        status: 'accepted' | 'rejected'
    ) {
        router.patch(
            `/collaboration-requests/${requestId}`,
            { status },
            { preserveScroll: true }
        );
    }

    function cancelRequest(requestId: number) {
        router.patch(
            `/collaboration-requests/${requestId}/cancel`,
            {},
            { preserveScroll: true }
        );
    }

    function inviteStudent(postId: number) {
        router.post(
            `/collaboration/${postId}/invitations`,
            { student_id: inviteStudentIds[postId] || '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setInviteStudentIds((previous) => ({
                        ...previous,
                        [postId]: '',
                    }));
                },
            }
        );
    }

    function respondToInvitation(invitationId: number, action: 'accept' | 'decline') {
        router.patch(
            `/collaboration-invitations/${invitationId}/${action}`,
            {},
            { preserveScroll: true }
        );
    }

    const selectClass =
        'mt-1 w-full rounded border border-gray-300 bg-white p-2 text-black';

    const optionClass = 'bg-white text-black';

    const inputClass =
        'mt-1 w-full rounded border border-gray-300 bg-white p-2 text-black placeholder-gray-500';

    const filteredPosts = posts
        .filter((post) => (
            post.status === 'open' ||
            post.user_id === currentUserId ||
            post.accepted_requests?.some((request) => request.user_id === currentUserId)
        ))
        .filter((post) => {
            const matchesActivity =
                activityFilter === 'All' ||
                post.activity_type === activityFilter;

            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                post.title.toLowerCase().includes(search) ||
                post.required_skills.toLowerCase().includes(search) ||
                post.department.toLowerCase().includes(search) ||
                (post.course_code || '').toLowerCase().includes(search);

            return matchesActivity && matchesSearch;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime();
            }

            return new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime();
        });

    return (
        <>
            <Head title="Student Collaboration Hub" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">
                    Student Collaboration Hub
                </h1>

                {/* ERROR MESSAGES FROM REQUESTS, POSTS AND INVITATIONS */}
                {(pageErrors.request || pageErrors.post || pageErrors.invite) && (
                    <div className="mb-6 rounded border border-red-400 bg-red-50 p-3 text-red-700">
                        {pageErrors.request || pageErrors.post || pageErrors.invite}
                    </div>
                )}

                {/* MY INVITATIONS */}
                {myInvitations.length > 0 && (
                    <div className="mb-8 rounded-lg border p-6">
                        <h2 className="mb-4 text-xl font-semibold">
                            My Invitations
                        </h2>

                        <div className="grid gap-3">
                            {myInvitations.map((invitation) => (
                                <div key={invitation.id} className="rounded border p-3">
                                    <p className="font-medium">
                                        {invitation.collaboration_post?.user?.name || 'Someone'} invited you to join
                                        "{invitation.collaboration_post?.title}"
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Activity: {invitation.collaboration_post?.activity_type}
                                    </p>

                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => respondToInvitation(invitation.id, 'accept')}
                                            className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                                        >
                                            Accept
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => respondToInvitation(invitation.id, 'decline')}
                                            className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CREATE POST */}
                <div className="mb-8 rounded-lg border p-6">
                    <h2 className="mb-6 text-xl font-semibold">
                        Create Collaboration Post
                    </h2>

                    <form onSubmit={submit} className="grid gap-4">
                        <label className="font-medium">
                            Post Title
                            <input
                                required
                                className={inputClass}
                                placeholder="Give your post a title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500">{errors.title}</p>}
                        </label>

                        <label className="font-medium">
                            Description
                            <textarea
                                required
                                className={inputClass}
                                placeholder="Describe what you are working on and whom you are looking for"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-red-500">{errors.description}</p>}
                        </label>

                        <label className="font-medium">
                            Activity Type
                            <select
                                className={selectClass}
                                value={data.activity_type}
                                onChange={(e) => {
                                    setData('activity_type', e.target.value);

                                    if (!['Assignment', 'Course Project'].includes(e.target.value)) {
                                        setData('section', '');
                                    }
                                }}
                            >
                                {activityTypes.map((type) => (
                                    <option className={optionClass} key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="font-medium">
                            Required Skills
                            <input
                                required
                                className={inputClass}
                                placeholder="e.g. Laravel, React, Python, UI Design"
                                value={data.required_skills}
                                onChange={(e) => setData('required_skills', e.target.value)}
                            />
                            {errors.required_skills && <p className="text-red-500">{errors.required_skills}</p>}
                        </label>

                        <label className="font-medium">
                            Department
                            <select
                                className={selectClass}
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                            >
                                {departments.map((department) => (
                                    <option className={optionClass} key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="font-medium">
                            Course Code (Optional)
                            <input
                                className={inputClass}
                                placeholder="e.g. CSE470"
                                value={data.course_code}
                                onChange={(e) => setData('course_code', e.target.value)}
                            />
                            {errors.course_code && <p className="text-red-500">{errors.course_code}</p>}
                        </label>

                        {['Assignment', 'Course Project'].includes(data.activity_type) && (
                            <label className="font-medium">
                                Section *
                                <input
                                    className={inputClass}
                                    placeholder="e.g. 01"
                                    value={data.section}
                                    onChange={(e) => setData('section', e.target.value)}
                                />
                                {errors.section && <p className="text-red-500">{errors.section}</p>}
                            </label>
                        )}

                        <label className="font-medium">
                            How many additional teammates are you looking for?
                            <input
                                required
                                type="number"
                                min="1"
                                className={inputClass}
                                value={data.teammates_needed}
                                onChange={(e) => setData('teammates_needed', Number(e.target.value))}
                            />
                            <span className="mt-1 block text-sm font-normal text-gray-500">
                                Enter the number of people you want to join your team.
                            </span>
                            {errors.teammates_needed && <p className="text-red-500">{errors.teammates_needed}</p>}
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Publishing...' : 'Publish Post'}
                        </button>
                    </form>
                </div>

                {/* SEARCH AND FILTERS */}
                <h2 className="mb-4 text-xl font-semibold">
                    Available Collaboration Posts
                </h2>

                <label className="mb-4 block font-medium">
                    Search Posts
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="Search by title, skills, department, or course"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </label>

                <button
                    type="button"
                    className="mb-4 rounded bg-gray-200 px-3 py-2 text-black"
                    onClick={() => setSearchTerm('')}
                >
                    Clear Search
                </button>

                <label className="mb-4 block font-medium">
                    Filter by Activity Type
                    <select
                        className={selectClass}
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value)}
                    >
                        <option value="All">All Activities</option>
                        {activityTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </label>

                <label className="mb-4 block font-medium">
                    Sort By
                    <select
                        className={selectClass}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </label>

                {/* POSTS */}
                {filteredPosts.length === 0 ? (
                    <p className="py-4 text-center text-gray-500">
                        No collaboration posts found.
                    </p>
                ) : (
                    <div className="grid gap-4">
                        {filteredPosts.map((post) => {
                            const isOwner = post.user_id === currentUserId;

                            const myRequest = post.collaboration_requests?.find(
                                (request) => request.user_id === currentUserId
                            );

                            const acceptedMembers = post.accepted_requests || [];
                            const acceptedCount = acceptedMembers.length;
                            const isEditing = editingPostId === post.id;

                            return (
                                <div key={post.id} className="rounded-lg border p-5">
                                    {isEditing ? (
                                        /* EDIT POST FORM */
                                        <form onSubmit={submitEdit} className="grid gap-4">
                                            <h3 className="text-xl font-semibold">
                                                Edit Collaboration Post
                                            </h3>

                                            <label className="font-medium">
                                                Post Title
                                                <input
                                                    required
                                                    className={inputClass}
                                                    value={editForm.data.title}
                                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                                />
                                                {editForm.errors.title && <p className="text-red-500">{editForm.errors.title}</p>}
                                            </label>

                                            <label className="font-medium">
                                                Description
                                                <textarea
                                                    required
                                                    className={inputClass}
                                                    value={editForm.data.description}
                                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                                />
                                                {editForm.errors.description && <p className="text-red-500">{editForm.errors.description}</p>}
                                            </label>

                                            <label className="font-medium">
                                                Activity Type
                                                <select
                                                    className={selectClass}
                                                    value={editForm.data.activity_type}
                                                    onChange={(e) => {
                                                        editForm.setData('activity_type', e.target.value);

                                                        if (!['Assignment', 'Course Project'].includes(e.target.value)) {
                                                            editForm.setData('section', '');
                                                        }
                                                    }}
                                                >
                                                    {activityTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="font-medium">
                                                Required Skills
                                                <input
                                                    required
                                                    className={inputClass}
                                                    value={editForm.data.required_skills}
                                                    onChange={(e) => editForm.setData('required_skills', e.target.value)}
                                                />
                                                {editForm.errors.required_skills && <p className="text-red-500">{editForm.errors.required_skills}</p>}
                                            </label>

                                            <label className="font-medium">
                                                Department
                                                <select
                                                    className={selectClass}
                                                    value={editForm.data.department}
                                                    onChange={(e) => editForm.setData('department', e.target.value)}
                                                >
                                                    {departments.map((department) => (
                                                        <option key={department} value={department}>{department}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="font-medium">
                                                Course Code (Optional)
                                                <input
                                                    className={inputClass}
                                                    value={editForm.data.course_code}
                                                    onChange={(e) => editForm.setData('course_code', e.target.value)}
                                                />
                                                {editForm.errors.course_code && <p className="text-red-500">{editForm.errors.course_code}</p>}
                                            </label>

                                            {['Assignment', 'Course Project'].includes(editForm.data.activity_type) && (
                                                <label className="font-medium">
                                                    Section *
                                                    <input
                                                        className={inputClass}
                                                        value={editForm.data.section}
                                                        onChange={(e) => editForm.setData('section', e.target.value)}
                                                    />
                                                    {editForm.errors.section && <p className="text-red-500">{editForm.errors.section}</p>}
                                                </label>
                                            )}

                                            <label className="font-medium">
                                                Additional Teammates Needed
                                                <input
                                                    required
                                                    type="number"
                                                    min={Math.max(1, acceptedCount)}
                                                    className={inputClass}
                                                    value={editForm.data.teammates_needed}
                                                    onChange={(e) => editForm.setData('teammates_needed', Number(e.target.value))}
                                                />
                                                {editForm.errors.teammates_needed && <p className="text-red-500">{editForm.errors.teammates_needed}</p>}
                                            </label>

                                            

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={editForm.processing}
                                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold">{post.title}</h3>

                                            <p className="mt-2">{post.description}</p>
                                            <p>Activity: {post.activity_type}</p>
                                            <p>Required Skills: {post.required_skills}</p>
                                            <p>Department: {post.department}</p>

                                            {post.course_code && <p>Course: {post.course_code}</p>}
                                            {post.section && <p>Section: {post.section}</p>}

                                            <p>
                                                Additional Teammates Needed: {post.teammates_needed}
                                            </p>

                                            <p className="mt-2 font-semibold">
                                                Team Capacity: {acceptedCount} / {post.teammates_needed} additional members
                                            </p>

                                            <div className="mt-3">
                                                <h4 className="font-semibold">Accepted Team Members</h4>

                                                {acceptedMembers.length > 0 ? (
                                                    <ul className="mt-1 list-inside list-disc">
                                                        {acceptedMembers.map((member) => (
                                                            <li key={member.id}>
                                                                {member.user?.name || 'Unknown'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">
                                                        No teammates have joined yet.
                                                    </p>
                                                )}
                                            </div>

                                            <p className="mt-2">
                                                Status:{' '}
                                                <span className="font-semibold capitalize">
                                                    {post.status}
                                                </span>
                                            </p>

                                            <p>Posted by: {post.user?.name || 'Unknown'}</p>

                                            {/* OWNER ACTIONS */}
                                            {isOwner && (
                                                <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                                                    {post.status === 'open' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditing(post)}
                                                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                        >
                                                            Edit Post
                                                        </button>
                                                    )}

                                                    {(post.status === 'open' || post.status === 'full') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => closePost(post.id)}
                                                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                                        >
                                                            Close Post
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* STUDENT REQUEST AREA */}
                                            {!isOwner && post.status === 'open' && (
                                                <div className="mt-4 border-t pt-4">
                                                    {myRequest && myRequest.status !== 'cancelled' ? (
                                                        <div>
                                                            <p className="font-medium">
                                                                Your Request Status:{' '}
                                                                <span className="capitalize">{myRequest.status}</span>
                                                            </p>

                                                            {myRequest.status === 'pending' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => cancelRequest(myRequest.id)}
                                                                    className="mt-2 rounded bg-gray-300 px-3 py-2 text-black hover:bg-gray-400"
                                                                >
                                                                    Cancel Request
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <label className="block font-medium">
                                                                Message to Post Owner (Optional)
                                                                <textarea
                                                                    className={inputClass}
                                                                    placeholder="Introduce yourself or explain why you want to join..."
                                                                    value={requestMessages[post.id] || ''}
                                                                    onChange={(e) =>
                                                                        setRequestMessages((previous) => ({
                                                                            ...previous,
                                                                            [post.id]: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </label>

                                                            <button
                                                                type="button"
                                                                onClick={() => sendCollaborationRequest(post.id)}
                                                                className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                            >
                                                                Send Request
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* OWNER: INVITE A STUDENT */}
                                            {isOwner && post.status === 'open' && (
                                                <div className="mt-5 border-t pt-4">
                                                    <h4 className="mb-3 text-lg font-semibold">
                                                        Invite a Student
                                                    </h4>

                                                    <div className="flex flex-wrap gap-2">
                                                        <input
                                                            className={inputClass + ' max-w-xs'}
                                                            placeholder="Student ID, e.g. 21101234"
                                                            value={inviteStudentIds[post.id] || ''}
                                                            onChange={(e) =>
                                                                setInviteStudentIds((previous) => ({
                                                                    ...previous,
                                                                    [post.id]: e.target.value,
                                                                }))
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => inviteStudent(post.id)}
                                                            className="mt-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                                        >
                                                            Send Invitation
                                                        </button>
                                                    </div>

                                                    {post.invitations?.length > 0 && (
                                                        <ul className="mt-3 list-inside list-disc text-sm">
                                                            {post.invitations.map((invitation) => (
                                                                <li key={invitation.id}>
                                                                    {invitation.user?.name || 'Unknown'}:{' '}
                                                                    <span className="capitalize">{invitation.status}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}

                                            {/* OWNER REQUEST MANAGEMENT */}
                                            {isOwner && (
                                                <div className="mt-5 border-t pt-4">
                                                    <h4 className="mb-3 text-lg font-semibold">
                                                        Collaboration Requests
                                                    </h4>

                                                    {post.collaboration_requests?.some((request) => request.status !== 'cancelled') ? (
                                                        <div className="grid gap-3">
                                                            {post.collaboration_requests
                                                                .filter((request) => request.status !== 'cancelled')
                                                                .map((request) => (
                                                                <div key={request.id} className="rounded border p-3">
                                                                    <p className="font-medium">
                                                                        Applicant: {request.user?.name || 'Unknown'}
                                                                    </p>

                                                                    <p>
                                                                        Message: {request.message || 'No message provided'}
                                                                    </p>

                                                                    <p>
                                                                        Status:{' '}
                                                                        <span className="capitalize">{request.status}</span>
                                                                    </p>

                                                                    {request.status === 'pending' && (
                                                                        <div className="mt-3 flex gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateRequestStatus(request.id, 'accepted')}
                                                                                disabled={
                                                                                    post.status !== 'open' ||
                                                                                    acceptedCount >= post.teammates_needed
                                                                                }
                                                                                className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            >
                                                                                Accept
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateRequestStatus(request.id, 'rejected')}
                                                                                className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500">
                                                            No collaboration requests yet.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
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
