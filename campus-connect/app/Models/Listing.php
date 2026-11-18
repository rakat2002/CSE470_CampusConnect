<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Listing extends Model
{
    public const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Hostel Items', 'Clothing', 'Stationery', 'Sports', 'Others'];

    public const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

    protected $fillable = ['name', 'description', 'price', 'category', 'condition', 'status'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }

    // Each listing belongs to one seller (a student)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}