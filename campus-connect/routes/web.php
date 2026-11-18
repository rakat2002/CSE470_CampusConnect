<?php
use App\Http\Controllers\ListingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonorController;
Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('blood/donors', [DonorController::class, 'index'])->name('donors.index');
    Route::get('blood/my-donor', [DonorController::class, 'edit'])->name('donors.edit');
    Route::post('blood/my-donor', [DonorController::class, 'save'])->name('donors.save');


        // Campus Marketplace (Member 1)
    Route::get('marketplace', [ListingController::class, 'index'])->name('listings.index');
    Route::get('marketplace/mine', [ListingController::class, 'mine'])->name('listings.mine');
    Route::get('marketplace/create', [ListingController::class, 'create'])->name('listings.create');
    Route::post('marketplace', [ListingController::class, 'store'])->name('listings.store');
    Route::get('marketplace/{listing}/edit', [ListingController::class, 'edit'])->name('listings.edit');
    Route::put('marketplace/{listing}', [ListingController::class, 'update'])->name('listings.update');
    Route::delete('marketplace/{listing}', [ListingController::class, 'destroy'])->name('listings.destroy');
    Route::patch('marketplace/{listing}/sold', [ListingController::class, 'markSold'])->name('listings.sold');
});

require __DIR__.'/settings.php';
