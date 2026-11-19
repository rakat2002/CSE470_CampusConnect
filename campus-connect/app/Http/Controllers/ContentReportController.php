<?php

namespace App\Http\Controllers;

use App\Models\ContentReport;
use App\Models\Question;
use App\Models\Reply;
use App\Models\StudyResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContentReportController extends Controller
{
    // A student reports a resource, question or reply
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(array_keys(ContentReport::TYPES))],
            'id' => 'required|integer',
            'reason' => 'required|string|min:5|max:500',
        ]);

        $modelClass = ContentReport::TYPES[$validated['type']];
        $target = $modelClass::findOrFail($validated['id']);
        $userId = (int) $request->user()->id;

        if ((int) $target->user_id === $userId) {
            return back()->withErrors(['report' => 'You cannot report your own content.']);
        }

        $alreadyReported = ContentReport::where('user_id', $userId)
            ->where('reportable_type', $modelClass)
            ->where('reportable_id', $target->id)
            ->where('status', 'pending')
            ->exists();

        if ($alreadyReported) {
            return back()->withErrors(['report' => 'You have already reported this.']);
        }

        $target->reports()->create([
            'user_id' => $userId,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back();
    }

    // Admin: list of pending reports
    public function index(Request $request)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $reports = ContentReport::with(['user:id,name', 'reportable'])
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function (ContentReport $report) {
                $target = $report->reportable;

                return [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'reported_by' => $report->user?->name,
                    'created_at' => $report->created_at,
                    'type' => array_search($report->reportable_type, ContentReport::TYPES, true),
                    'target_exists' => $target !== null,
                    'target_hidden' => (bool) ($target?->is_hidden),
                    'target_text' => match (true) {
                        $target instanceof StudyResource => $target->title.' ('.$target->course_code.')',
                        $target instanceof Question => $target->title,
                        $target instanceof Reply => mb_strimwidth($target->content, 0, 120, '...'),
                        default => 'Deleted content',
                    },
                    'target_link' => match (true) {
                        $target instanceof StudyResource => '/resources',
                        $target instanceof Question => '/questions/'.$target->id,
                        $target instanceof Reply => '/questions/'.$target->question_id,
                        default => null,
                    },
                ];
            });

        return inertia('ResourceHub/Reports', [
            'reports' => $reports,
        ]);
    }

    // Admin: hide the reported content and close all its pending reports
    public function hide(Request $request, ContentReport $contentReport)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $target = $contentReport->reportable;

        if ($target) {
            $target->update(['is_hidden' => true]);

            ContentReport::where('reportable_type', $contentReport->reportable_type)
                ->where('reportable_id', $contentReport->reportable_id)
                ->where('status', 'pending')
                ->update(['status' => 'resolved']);
        } else {
            $contentReport->update(['status' => 'resolved']);
        }

        return back();
    }

    // Admin: the report is not valid
    public function dismiss(Request $request, ContentReport $contentReport)
    {
        abort_if($request->user()->role !== 'admin', 403);

        $contentReport->update(['status' => 'dismissed']);

        return back();
    }
}
