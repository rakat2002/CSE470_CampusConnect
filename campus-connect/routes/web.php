
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudyPlannerController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FeedbackReportController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Study Planner
    Route::get('/study-planner', [StudyPlannerController::class, 'index'])
        ->name('study-planner.index');

    Route::post('/study-planner', [StudyPlannerController::class, 'store'])
        ->name('study-planner.store');

    Route::put('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'update'])
        ->name('study-planner.update');

    Route::delete('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'destroy'])
        ->name('study-planner.destroy');

    // Feedback
    Route::get('/feedback', [FeedbackController::class, 'index'])
        ->name('feedback.index');

    Route::post('/feedback', [FeedbackController::class, 'store'])
        ->name('feedback.store');

    Route::delete('/feedback/{feedback}', [FeedbackController::class, 'destroy'])
        ->name('feedback.destroy');

    // Report Feedback
    Route::post('/feedback/{feedback}/report', [FeedbackReportController::class, 'store'])
        ->name('feedback.report');
});

require __DIR__.'/settings.php';
