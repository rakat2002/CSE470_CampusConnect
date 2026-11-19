<?php

namespace App\Http\Controllers;

use App\Models\StudyPlannerItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudyPlannerController extends Controller
{
    public function index()
    {
        $items = StudyPlannerItem::where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('StudyPlanner/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:note,task',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'course_code' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high',
            'due_date' => 'nullable|date',
        ]);

        StudyPlannerItem::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('study-planner.index');
    }

    public function update(Request $request, StudyPlannerItem $studyPlannerItem)
    {
        abort_unless($studyPlannerItem->user_id === Auth::id(), 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'course_code' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high',
            'due_date' => 'nullable|date',
            'is_completed' => 'sometimes|boolean',
        ]);

        $studyPlannerItem->update($validated);

        return redirect()->route('study-planner.index');
    }

    public function destroy(StudyPlannerItem $studyPlannerItem)
    {
        abort_unless($studyPlannerItem->user_id === Auth::id(), 403);

        $studyPlannerItem->delete();

        return redirect()->route('study-planner.index');
    }
}
