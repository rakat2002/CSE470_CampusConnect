<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryAlbum extends Model
{
    public const CATEGORIES = [
        'Orientation',
        'Club Fair',
        'Hackathons',
        'Cultural Programs',
        'Workshops',
        'Competitions',
        'Farewell Programs',
        'Campus Life',
    ];

    public const SEMESTERS = ['Spring', 'Summer', 'Fall'];

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'album_type',
        'category',
        'semester',
        'year',
        'department',
        'club_name',
        'cover_image',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(GalleryItem::class);
    }

    public function reports()
    {
        return $this->morphMany(ContentReport::class, 'reportable');
    }
}
