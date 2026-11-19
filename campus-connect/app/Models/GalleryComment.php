<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryComment extends Model
{
    protected $fillable = [
        'user_id',
        'gallery_item_id',
        'content',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(GalleryItem::class, 'gallery_item_id');
    }
}
