<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterEdition extends Model
{
    protected $fillable = [
        'edition_number',
        'title',
        'summary',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function articles()
    {
        return $this->hasMany(NewsletterArticle::class);
    }
}
