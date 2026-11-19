<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudyPlannerController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/study-planner', [StudyPlannerController::class, 'index'])
        ->name('study-planner.index');

    Route::post('/study-planner', [StudyPlannerController::class, 'store'])
        ->name('study-planner.store');

    Route::put('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'update'])
        ->name('study-planner.update');

    Route::delete('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'destroy'])
        ->name('study-planner.destroy');
});

require __DIR__.'/settings.php';
