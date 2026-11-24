<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FacultyProfile;

class FacultyProfileSeeder extends Seeder
{
    public function run(): void
    {
        FacultyProfile::insert([
            [
                'name' => 'Dr. Example Faculty',
                'department' => 'Computer Science and Engineering',
                'designation' => 'Associate Professor',
                'email' => 'faculty@example.com',
                'office_location' => 'BRAC University',
                'consultation_days' => 'Sunday, Tuesday',
                'consultation_hours' => '10:00 AM - 12:00 PM',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ms. Sample Lecturer',
                'department' => 'Computer Science and Engineering',
                'designation' => 'Lecturer',
                'email' => 'lecturer@example.com',
                'office_location' => 'BRAC University',
                'consultation_days' => 'Monday, Wednesday',
                'consultation_hours' => '2:00 PM - 4:00 PM',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}