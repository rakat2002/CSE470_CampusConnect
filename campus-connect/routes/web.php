<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonorController;
Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('blood/donors', [DonorController::class, 'index'])->name('donors.index');
    Route::get('blood/my-donor', [DonorController::class, 'edit'])->name('donors.edit');
    Route::post('blood/my-donor', [DonorController::class, 'save'])->name('donors.save');
});

require __DIR__.'/settings.php';
