<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyResource extends Model
{
    public const ALLOWED_TYPES = ['pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png'];
    public const MAX_SIZE_KB = 10240; // 10 MB

    protected $fillable = [
        'user_id',
        'title',
        'course_code',
        'topic',
        'description',
        'file_path',
        'original_name',
        'file_type',
        'file_size_kb',
        'is_hidden',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
    ];

    // Never send the storage path to the browser; files are downloaded through the controller
    protected $hidden = ['file_path'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reports()
    {
        return $this->morphMany(ContentReport::class, 'reportable');
    }
}
