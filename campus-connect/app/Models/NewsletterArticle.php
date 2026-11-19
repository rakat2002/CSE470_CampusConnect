<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterArticle extends Model
{
    public const CATEGORIES = [
        'Upcoming Events',
        'Club Activities',
        'Achievements',
        'Research Updates',
        'Academic Announcements',
        'Opportunities',
    ];

    protected $fillable = [
        'newsletter_edition_id',
        'user_id',
        'title',
        'description',
        'category',
        'cover_image',
        'relevant_links',
        'event_link',
        'status',
        'admin_feedback',
        'views_count',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'views_count' => 'integer',
    ];

    public function edition()
    {
        return $this->belongsTo(NewsletterEdition::class, 'newsletter_edition_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bookmarks()
    {
        return $this->hasMany(NewsletterBookmark::class);
    }

    public function reports()
    {
        return $this->morphMany(ContentReport::class, 'reportable');
    }

    public function isBookmarkedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }
}
