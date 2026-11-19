<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\CollaborationPost;

class CollaborationRequest extends Model
{
    protected $fillable = [
        'collaboration_post_id',
        'user_id',
        'message',
        'status',
    ];

    public function collaborationPost()
    {
        return $this->belongsTo(CollaborationPost::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
