<?php

use App\Http\Controllers\CollaborationInvitationController;
use App\Http\Controllers\CollaborationPostController;
use App\Http\Controllers\DonorController;
use App\Http\Controllers\ListingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ===== Blood Donation (Member 1) =====
    Route::get('blood/donors', [DonorController::class, 'index'])->name('donors.index');
    Route::get('blood/my-donor', [DonorController::class, 'edit'])->name('donors.edit');
    Route::post('blood/my-donor', [DonorController::class, 'save'])->name('donors.save');

    // ===== Campus Marketplace (Member 1) =====
    Route::get('marketplace', [ListingController::class, 'index'])->name('listings.index');
    Route::get('marketplace/mine', [ListingController::class, 'mine'])->name('listings.mine');
    Route::get('marketplace/create', [ListingController::class, 'create'])->name('listings.create');
    Route::post('marketplace', [ListingController::class, 'store'])->name('listings.store');
    Route::get('marketplace/{listing}/edit', [ListingController::class, 'edit'])->name('listings.edit');
    Route::put('marketplace/{listing}', [ListingController::class, 'update'])->name('listings.update');
    Route::delete('marketplace/{listing}', [ListingController::class, 'destroy'])->name('listings.destroy');
    Route::patch('marketplace/{listing}/sold', [ListingController::class, 'markSold'])->name('listings.sold');

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
