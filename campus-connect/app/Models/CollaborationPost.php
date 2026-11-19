<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\CollaborationRequest;
use App\Models\CollaborationInvitation;

class CollaborationPost extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'activity_type',
        'required_skills',
        'department',
        'course_code',
        'section',
        'teammates_needed',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function acceptedRequests()
    {
        return $this->hasMany(CollaborationRequest::class)
            ->where('status', 'accepted');
    }

    public function invitations()
    {
        return $this->hasMany(CollaborationInvitation::class);
    }

    // Number of accepted teammates (from join requests and accepted invitations)
    public function acceptedCount(): int
    {
        return $this->collaborationRequests()
            ->where('status', 'accepted')
            ->count();
    }

    public function isFull(): bool
    {
        return $this->acceptedCount() >= $this->teammates_needed;
    }

    // Keep status in sync with the team size: Open <-> Full. Closed posts stay closed.
    public function refreshStatus(): void
    {
        if ($this->status === 'closed') {
            return;
        }

        $this->update([
            'status' => $this->isFull() ? 'full' : 'open',
        ]);
    }
}
