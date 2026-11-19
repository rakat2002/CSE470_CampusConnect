<?php
use App\Http\Controllers\AdminController;
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
    // Admin Panel — only users with role = admin
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::patch('listings/{listing}/approve', [AdminController::class, 'approveListing'])->name('listings.approve');
    Route::patch('listings/{listing}/reject', [AdminController::class, 'rejectListing'])->name('listings.reject');
    Route::patch('donors/{donor}/approve', [AdminController::class, 'approveDonor'])->name('donors.approve');
    Route::patch('donors/{donor}/reject', [AdminController::class, 'rejectDonor'])->name('donors.reject');
});


require __DIR__.'/settings.php';
