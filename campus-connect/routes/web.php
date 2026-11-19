<?php

use App\Http\Controllers\CollaborationInvitationController;
use App\Http\Controllers\CollaborationPostController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ===== Student Collaboration Hub (Member 2) =====
    Route::get('/collaboration', [CollaborationPostController::class, 'index'])
        ->name('collaboration.index');

    Route::post('/collaboration', [CollaborationPostController::class, 'store'])
        ->name('collaboration.store');

    Route::patch('/collaboration/{collaborationPost}', [CollaborationPostController::class, 'update'])
        ->name('collaboration.update');

    Route::patch('/collaboration/{collaborationPost}/close', [CollaborationPostController::class, 'close'])
        ->name('collaboration.close');

    Route::post('/collaboration/{collaborationPost}/requests', [CollaborationPostController::class, 'sendRequest'])
        ->name('collaboration.requests.store');

    Route::patch('/collaboration-requests/{collaborationRequest}', [CollaborationPostController::class, 'updateRequestStatus'])
        ->name('collaboration.requests.update');

    Route::patch('/collaboration-requests/{collaborationRequest}/cancel', [CollaborationPostController::class, 'cancelRequest'])
        ->name('collaboration.requests.cancel');

    Route::post('/collaboration/{collaborationPost}/invitations', [CollaborationInvitationController::class, 'store'])
        ->name('collaboration.invitations.store');

    Route::patch('/collaboration-invitations/{collaborationInvitation}/accept', [CollaborationInvitationController::class, 'accept'])
        ->name('collaboration.invitations.accept');

    Route::patch('/collaboration-invitations/{collaborationInvitation}/decline', [CollaborationInvitationController::class, 'decline'])
        ->name('collaboration.invitations.decline');
});

require __DIR__.'/settings.php';