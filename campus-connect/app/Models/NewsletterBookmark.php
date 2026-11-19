<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterBookmark extends Model
{
    protected $fillable = [
        'user_id',
        'newsletter_article_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function article()
    {
        return $this->belongsTo(NewsletterArticle::class, 'newsletter_article_id');
    }
}
