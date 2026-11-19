<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentReport extends Model
{
    // What students can report in the Resource and Help Hub, Gallery & Newsletter
    public const TYPES = [
        'resource' => StudyResource::class,
        'question' => Question::class,
        'reply' => Reply::class,
        'gallery_item' => GalleryItem::class,
        'newsletter_article' => NewsletterArticle::class,
    ];

    protected $fillable = [
        'user_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'status',
    ];

    // The student who reported
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // The reported resource, question or reply
    public function reportable()
    {
        return $this->morphTo();
    }
}
