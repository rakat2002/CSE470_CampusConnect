<?php

use App\Models\NewsletterArticle;
use App\Models\NewsletterEdition;
use App\Models\User;

test('students can view the newsletter index', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('newsletter.index'));

    $response->assertOk();
});

test('students can submit an article proposal for review', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('newsletter.submit.store'), [
        'title' => 'BRACU Debating Club Wins Championship',
        'category' => 'Achievements',
        'description' => 'Our debating team outperformed 32 universities to take first place in the tournament finals.',
    ]);

    $response->assertRedirect('/newsletter?tab=my_submissions');

    $article = NewsletterArticle::where('title', 'BRACU Debating Club Wins Championship')->first();
    expect($article)->not->toBeNull();
    expect($article->status)->toBe('pending');
    expect($article->user_id)->toBe($user->id);
});

test('admin can access editorial desk but students are forbidden', function () {
    $student = User::factory()->create(['role' => 'student']);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($student)->get(route('newsletter.admin'))->assertForbidden();
    $this->actingAs($admin)->get(route('newsletter.admin'))->assertOk();
});

test('admin can approve and assign an article to an edition', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $author = User::factory()->create();
    $edition = NewsletterEdition::create([
        'edition_number' => 99,
        'title' => 'Test Edition 99',
        'status' => 'published',
        'published_at' => now(),
    ]);

    $article = NewsletterArticle::create([
        'user_id' => $author->id,
        'title' => 'Groundbreaking AI Paper Accepted',
        'category' => 'Research Updates',
        'description' => 'A detailed summary of the research methodology and benchmark results.',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->patch(route('newsletter.articles.status', $article), [
        'status' => 'approved',
        'newsletter_edition_id' => $edition->id,
        'admin_feedback' => 'Great work!',
    ]);

    $response->assertRedirect();
    $article->refresh();

    expect($article->status)->toBe('approved');
    expect($article->newsletter_edition_id)->toBe($edition->id);
    expect($article->admin_feedback)->toBe('Great work!');
});

test('students can toggle bookmarks on articles', function () {
    $user = User::factory()->create();
    $article = NewsletterArticle::create([
        'user_id' => $user->id,
        'title' => 'Interesting Campus Article',
        'category' => 'Upcoming Events',
        'description' => 'Full event announcement with dates and schedules.',
        'status' => 'approved',
    ]);

    // Bookmark
    $this->actingAs($user)->post(route('newsletter.bookmark', $article))->assertRedirect();
    expect($article->isBookmarkedBy($user))->toBeTrue();

    // Remove bookmark
    $this->actingAs($user)->post(route('newsletter.bookmark', $article))->assertRedirect();
    expect($article->isBookmarkedBy($user))->toBeFalse();
});

test('reading an article increments the views count', function () {
    $user = User::factory()->create();
    $article = NewsletterArticle::create([
        'user_id' => $user->id,
        'title' => 'High Traffic Tech Article',
        'category' => 'Opportunities',
        'description' => 'Internship opening details and application guidelines.',
        'status' => 'approved',
        'views_count' => 5,
    ]);

    $this->actingAs($user)->get(route('newsletter.show', $article))->assertOk();

    expect($article->refresh()->views_count)->toBe(6);
});
