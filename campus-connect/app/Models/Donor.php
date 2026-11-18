<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donor extends Model
{
    public const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Minimum days between donations. Later the Admin will set this value.
    public const DONATION_GAP_DAYS = 120;

    protected $fillable = [
        'blood_group', 'area', 'phone', 'is_available', 'last_donation_date',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'last_donation_date' => 'date:Y-m-d',
        ];
    }

    // Each donor belongs to one student
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Business rule: only Available donors outside the donation gap
    public function scopeEligible(Builder $query): Builder
    {
        return $query->where('is_available', true)
            ->where(function (Builder $q) {
                $q->whereNull('last_donation_date')
                  ->orWhere('last_donation_date', '<=', now()->subDays(self::DONATION_GAP_DAYS)->toDateString());
            });
    }
}