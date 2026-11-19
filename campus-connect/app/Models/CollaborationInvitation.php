<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\CollaborationPost;

class CollaborationInvitation extends Model
{
    protected $fillable = [
        'collaboration_post_id',
        'user_id',
        'status',
    ];

    public function collaborationPost()
    {
        return $this->belongsTo(CollaborationPost::class);
    }

    // The invited student
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
