<?php

namespace App\Http\Controllers;

use App\Models\StudyResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudyResourceController extends Controller
{
    // Browse and search resources
    public function index(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $search = trim((string) $request->input('search', ''));

        $resources = StudyResource::with('user:id,name,department')
            // Hidden resources: only the admin and the uploader can still see them
            ->when(! $isAdmin, function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('is_hidden', false)->orWhere('user_id', $user->id);
                });
            })
            // Search by title, course code or topic
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%'.$search.'%')
                        ->orWhere('course_code', 'like', '%'.$search.'%')
                        ->orWhere('topic', 'like', '%'.$search.'%');
                });
            })
            ->latest()
            ->get();

        return inertia('ResourceHub/Resources', [
            'resources' => $resources,
            'filters' => ['search' => $search],
            'currentUserId' => $user->id,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'course_code' => 'required|string|max:20',
            'topic' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'file' => 'required|file|mimes:'.implode(',', StudyResource::ALLOWED_TYPES).'|max:'.StudyResource::MAX_SIZE_KB,
        ], [
            'file.mimes' => 'Only PDF, DOCX, PPTX, JPG and PNG files are allowed.',
            'file.max' => 'The file must not be larger than 10 MB.',
        ]);

        $file = $request->file('file');

        StudyResource::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'course_code' => strtoupper($validated['course_code']),
            'topic' => $validated['topic'],
            'description' => $validated['description'] ?? null,
            // Stored privately; students download it through this app
            'file_path' => $file->store('study-resources', 'local'),
            'original_name' => $file->getClientOriginalName(),
            'file_type' => strtolower($file->getClientOriginalExtension()),
            'file_size_kb' => (int) ceil($file->getSize() / 1024),
        ]);

        return back();
    }

    // The uploader can edit the details (not the file)
    public function update(Request $request, StudyResource $studyResource)
    {
        abort_if(! $this->isOwner($request, $studyResource), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'course_code' => 'required|string|max:20',
            'topic' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        $validated['course_code'] = strtoupper($validated['course_code']);

        $studyResource->update($validated);

        return back();
    }

    // The uploader or the admin can delete a resource
    public function destroy(Request $request, StudyResource $studyResource)
    {
        $user = $request->user();
        abort_if(! $this->isOwner($request, $studyResource) && $user->role !== 'admin', 403);

        Storage::disk('local')->delete($studyResource->file_path);
        $studyResource->delete();

        return back();
    }

    public function download(Request $request, StudyResource $studyResource)
    {
        $user = $request->user();

        // A hidden resource cannot be downloaded by other students
        if ($studyResource->is_hidden && ! $this->isOwner($request, $studyResource) && $user->role !== 'admin') {
            abort(404);
        }

        return Storage::disk('local')->download($studyResource->file_path, $studyResource->original_name);
    }

    // Admin: hide or show again
    public function toggleHidden(Request $request, StudyResource $studyResource)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $studyResource->update(['is_hidden' => ! $studyResource->is_hidden]);

        return back();
    }

    private function isOwner(Request $request, StudyResource $studyResource): bool
    {
        return (int) $studyResource->user_id === (int) $request->user()->id;
    }
}
