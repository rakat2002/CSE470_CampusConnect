<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    protected $fillable = [
        'gallery_album_id',
        'user_id',
        'type',
        'file_path',
        'youtube_url',
        'youtube_video_id',
        'caption',
        'description',
        'tags',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
    ];

    public function album()
    {
        return $this->belongsTo(GalleryAlbum::class, 'gallery_album_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(GalleryLike::class);
    }

    public function comments()
    {
        return $this->hasMany(GalleryComment::class)->latest();
    }

    public function reports()
    {
        return $this->morphMany(ContentReport::class, 'reportable');
    }

    public function isLikedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public static function extractYouTubeId(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/\s]{11})%i', $url, $match)) {
            return $match[1];
        }

        return null;
    }
}
