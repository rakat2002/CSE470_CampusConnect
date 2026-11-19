<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudyPlannerController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\FeedbackReportController;

use App\Http\Controllers\CollaborationInvitationController;
use App\Http\Controllers\CollaborationPostController;
use App\Http\Controllers\ContentReportController;
use App\Http\Controllers\DonorController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\StudyResourceController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ===== Study Planner (Tisha) =====
    Route::get('/study-planner', [StudyPlannerController::class, 'index'])
        ->name('study-planner.index');

    Route::post('/study-planner', [StudyPlannerController::class, 'store'])
        ->name('study-planner.store');

    Route::put('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'update'])
        ->name('study-planner.update');

    Route::delete('/study-planner/{studyPlannerItem}', [StudyPlannerController::class, 'destroy'])
        ->name('study-planner.destroy');

    // ===== Feedback and Rating (Tisha) =====
    Route::get('/feedback', [FeedbackController::class, 'index'])
        ->name('feedback.index');

    Route::post('/feedback', [FeedbackController::class, 'store'])
        ->name('feedback.store');

    Route::delete('/feedback/{feedback}', [FeedbackController::class, 'destroy'])
        ->name('feedback.destroy');

    Route::post('/feedback/{feedback}/report', [FeedbackReportController::class, 'store'])
        ->name('feedback.report');

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

    // ===== Academic Resource and Help Hub (Member 2) =====
    Route::get('/resources', [StudyResourceController::class, 'index'])->name('resources.index');
    Route::post('/resources', [StudyResourceController::class, 'store'])->name('resources.store');
    Route::patch('/resources/{studyResource}', [StudyResourceController::class, 'update'])->name('resources.update');
    Route::delete('/resources/{studyResource}', [StudyResourceController::class, 'destroy'])->name('resources.destroy');
    Route::get('/resources/{studyResource}/download', [StudyResourceController::class, 'download'])->name('resources.download');
    Route::patch('/resources/{studyResource}/toggle-hidden', [StudyResourceController::class, 'toggleHidden'])->name('resources.toggle-hidden');

    // Questions and replies
    Route::get('/questions', [QuestionController::class, 'index'])->name('questions.index');
    Route::post('/questions', [QuestionController::class, 'store'])->name('questions.store');
    Route::get('/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');
    Route::post('/questions/{question}/replies', [QuestionController::class, 'storeReply'])->name('questions.replies.store');
    Route::patch('/questions/{question}/toggle-hidden', [QuestionController::class, 'toggleHidden'])->name('questions.toggle-hidden');
    Route::patch('/replies/{reply}/accept', [QuestionController::class, 'acceptReply'])->name('replies.accept');
    Route::patch('/replies/{reply}/toggle-hidden', [QuestionController::class, 'toggleReplyHidden'])->name('replies.toggle-hidden');

    // Content Reports
    Route::post('/content-reports', [ContentReportController::class, 'store'])->name('content-reports.store');
    Route::get('/content-reports', [ContentReportController::class, 'index'])->name('content-reports.index');
    Route::patch('/content-reports/{contentReport}/hide', [ContentReportController::class, 'hide'])->name('content-reports.hide');
    Route::patch('/content-reports/{contentReport}/dismiss', [ContentReportController::class, 'dismiss'])->name('content-reports.dismiss');

    // ===== Campus Newsletter - Weekly (Member 5) =====
    Route::get('/newsletter', [NewsletterController::class, 'index'])->name('newsletter.index');
    Route::get('/newsletter/submit', [NewsletterController::class, 'createSubmission'])->name('newsletter.submit');
    Route::post('/newsletter/submit', [NewsletterController::class, 'storeSubmission'])->name('newsletter.submit.store');
    Route::get('/newsletter/article/{article}', [NewsletterController::class, 'show'])->name('newsletter.show');
    Route::post('/newsletter/article/{article}/bookmark', [NewsletterController::class, 'toggleBookmark'])->name('newsletter.bookmark');
    Route::get('/newsletter/admin', [NewsletterController::class, 'adminIndex'])->name('newsletter.admin');
    Route::post('/newsletter/admin/editions', [NewsletterController::class, 'storeEdition'])->name('newsletter.editions.store');
    Route::patch('/newsletter/admin/editions/{edition}/publish', [NewsletterController::class, 'publishEdition'])->name('newsletter.editions.publish');
    Route::patch('/newsletter/admin/articles/{article}/status', [NewsletterController::class, 'updateSubmissionStatus'])->name('newsletter.articles.status');

    // ===== Campus Memory Gallery (Member 5) =====
    Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');
    Route::post('/gallery/albums', [GalleryController::class, 'storeAlbum'])->name('gallery.albums.store');
    Route::get('/gallery/albums/{album}', [GalleryController::class, 'showAlbum'])->name('gallery.album.show');
    Route::post('/gallery/media', [GalleryController::class, 'storeMedia'])->name('gallery.media.store');
    Route::post('/gallery/media/{item}/like', [GalleryController::class, 'toggleLike'])->name('gallery.media.like');
    Route::post('/gallery/media/{item}/comments', [GalleryController::class, 'storeComment'])->name('gallery.comments.store');
    Route::delete('/gallery/comments/{comment}', [GalleryController::class, 'destroyComment'])->name('gallery.comments.destroy');
    Route::delete('/gallery/media/{item}', [GalleryController::class, 'destroyMedia'])->name('gallery.media.destroy');
});

require __DIR__.'/settings.php';
