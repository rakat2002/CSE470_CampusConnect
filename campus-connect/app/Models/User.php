<?php

namespace App\Models;

use App\Models\CollaborationPost;
use App\Models\CollaborationRequest;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'student_id', 'department', 'phone', 'role', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // ===== Member 1: Blood Donation and Marketplace =====

    // A student can have one donor profile
    public function donor(): HasOne
    {
        return $this->hasOne(Donor::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    // ===== Member 2: Student Collaboration Hub =====

    public function collaborationPosts()
    {
        return $this->hasMany(CollaborationPost::class);
    }

    public function collaborationRequests()
    {
        return $this->hasMany(CollaborationRequest::class);
    }

    public function receivedCollaborationRequests()
    {
        return $this->hasManyThrough(
            CollaborationRequest::class,
            CollaborationPost::class,
            'user_id',
            'collaboration_post_id'
        );
    }

    // ===== Member 5: Campus Newsletter & Memory Gallery =====

    public function newsletterArticles(): HasMany
    {
        return $this->hasMany(NewsletterArticle::class);
    }

    public function newsletterBookmarks(): HasMany
    {
        return $this->hasMany(NewsletterBookmark::class);
    }

    public function galleryAlbums(): HasMany
    {
        return $this->hasMany(GalleryAlbum::class);
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(GalleryItem::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
