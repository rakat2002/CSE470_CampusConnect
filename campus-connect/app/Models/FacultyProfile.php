<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyProfile extends Model
{
    protected $fillable = [
        'name',
        'department',
        'designation',
        'email',
        'office_location',
        'consultation_days',
        'consultation_hours',
    ];
}