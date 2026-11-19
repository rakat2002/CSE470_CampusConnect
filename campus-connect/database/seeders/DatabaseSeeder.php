<?php

namespace Database\Seeders;

use App\Models\CollaborationPost;
use App\Models\Question;
use App\Models\Reply;
use App\Models\StudyResource;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Run demo seeders for Donors & Marketplace
        $this->call([
            DonorDemoSeeder::class,
            MarketplaceDemoSeeder::class,
        ]);

        // 2. Demo Student User
        $student = User::firstOrCreate(
            ['email' => 'student@campusconnect.test'],
            [
                'name' => 'Alex Student',
                'student_id' => '20101099',
                'department' => 'CSE',
                'role' => 'student',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 3. Demo Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@campusconnect.test'],
            [
                'name' => 'Campus Admin',
                'student_id' => '10000001',
                'department' => 'CSE',
                'role' => 'admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 4. Demo Collaboration Post
        $postOwner = User::where('student_id', '20101001')->first() ?? $student;
        CollaborationPost::firstOrCreate(
            ['title' => 'Need Fullstack Dev for CSE470 Final Project'],
            [
                'user_id' => $postOwner->id,
                'description' => 'We are building a smart campus web app using Laravel and React. Need 2 teammates with React and backend skills.',
                'activity_type' => 'Course Project',
                'required_skills' => 'Laravel, React, TypeScript',
                'department' => 'CSE',
                'course_code' => 'CSE470',
                'section' => '01',
                'teammates_needed' => 2,
                'status' => 'open',
            ]
        );

        // 5. Demo Q&A Question & Reply
        $question = Question::firstOrCreate(
            ['title' => 'How to normalize database schema to BCNF for CSE370?'],
            [
                'user_id' => $student->id,
                'details' => 'Can someone explain when a relation is in 3NF but not in BCNF with a simple example?',
                'course_code' => 'CSE370',
                'topic' => 'Database Normalization',
                'status' => 'answered',
            ]
        );

        Reply::firstOrCreate(
            ['question_id' => $question->id, 'user_id' => $admin->id],
            [
                'content' => 'A relation is in BCNF if for every functional dependency X -> Y, X is a superkey. If X is not a superkey but Y is a prime attribute, it can be 3NF without being BCNF.',
                'is_accepted' => true,
            ]
        );

        // 6. Member 5: Weekly Newsletter & Campus Memory Gallery
        $this->call([
            NewsletterDemoSeeder::class,
            GalleryDemoSeeder::class,
        ]);
    }
}

