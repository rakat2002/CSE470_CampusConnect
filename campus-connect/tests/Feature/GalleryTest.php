<?php

use App\Models\GalleryAlbum;
use App\Models\GalleryComment;
use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('students can view the memory gallery index and feed', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('gallery.index'));

    $response->assertOk();
});

test('students can create a new memory album', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('gallery.albums.store'), [
        'title' => 'Orientation Fall 2026',
        'category' => 'Orientation',
        'album_type' => 'event',
        'semester' => 'Fall',
        'year' => 2026,
        'department' => 'CSE',
        'description' => 'Memories welcoming freshmen to campus.',
    ]);

    $album = GalleryAlbum::where('title', 'Orientation Fall 2026')->first();
    expect($album)->not->toBeNull();
    expect($album->user_id)->toBe($user->id);
    $response->assertRedirect(route('gallery.album.show', $album->id));
});

test('students can add a YouTube video memory to an album', function () {
    $user = User::factory()->create();
    $album = GalleryAlbum::create([
        'user_id' => $user->id,
        'title' => 'Robotics Showcase',
        'category' => 'Workshops',
        'semester' => 'Fall',
        'year' => 2026,
    ]);

    $response = $this->actingAs($user)->post(route('gallery.media.store'), [
        'gallery_album_id' => $album->id,
        'type' => 'video',
        'caption' => 'Rover Autonomous Navigation Demo',
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'tags' => 'robotics,rover,demo',
    ]);

    $response->assertRedirect();

    $item = GalleryItem::where('caption', 'Rover Autonomous Navigation Demo')->first();
    expect($item)->not->toBeNull();
    expect($item->type)->toBe('video');
    expect($item->youtube_video_id)->toBe('dQw4w9WgXcQ');
});

test('students can like and unlike memories', function () {
    $user = User::factory()->create();
    $item = GalleryItem::create([
        'user_id' => $user->id,
        'type' => 'video',
        'caption' => 'Fun Moments',
        'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ',
        'youtube_video_id' => 'dQw4w9WgXcQ',
    ]);

    // Like
    $this->actingAs($user)->post(route('gallery.media.like', $item))->assertRedirect();
    expect($item->isLikedBy($user))->toBeTrue();

    // Unlike
    $this->actingAs($user)->post(route('gallery.media.like', $item))->assertRedirect();
    expect($item->isLikedBy($user))->toBeFalse();
});

test('students can comment on memories and authorized users can delete comments', function () {
    $uploader = User::factory()->create();
    $commenter = User::factory()->create();
    $bystander = User::factory()->create();

    $item = GalleryItem::create([
        'user_id' => $uploader->id,
        'type' => 'video',
        'caption' => 'Campus Concert',
        'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ',
        'youtube_video_id' => 'dQw4w9WgXcQ',
    ]);

    // Comment
    $this->actingAs($commenter)->post(route('gallery.comments.store', $item), [
        'content' => 'Such a wonderful performance!',
    ])->assertRedirect();

    $comment = GalleryComment::where('content', 'Such a wonderful performance!')->first();
    expect($comment)->not->toBeNull();

    // Bystander cannot delete
    $this->actingAs($bystander)->delete(route('gallery.comments.destroy', $comment))->assertForbidden();

    // Commenter can delete
    $this->actingAs($commenter)->delete(route('gallery.comments.destroy', $comment))->assertRedirect();
    expect(GalleryComment::find($comment->id))->toBeNull();
});
