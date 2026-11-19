<?php

namespace Database\Seeders;

use App\Models\GalleryAlbum;
use App\Models\GalleryComment;
use App\Models\GalleryItem;
use App\Models\GalleryLike;
use App\Models\User;
use Illuminate\Database\Seeder;

class GalleryDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@campusconnect.test')->first()
            ?? User::first();
        $student = User::where('email', 'student@campusconnect.test')->first()
            ?? User::first();
        $donorUser = User::where('student_id', '20101001')->first()
            ?? $student;

        // 1. Album 1: Hackathon 2026
        $hackathonAlbum = GalleryAlbum::firstOrCreate(
            ['title' => 'BRACU Hackathon 2026 Finals'],
            [
                'user_id' => $admin->id,
                'description' => 'Unforgettable 36 hours of coding, hardware hacking, pitching, and teamwork at the annual campus hackathon.',
                'album_type' => 'event',
                'category' => 'Hackathons',
                'semester' => 'Fall',
                'year' => 2026,
                'department' => 'CSE',
                'club_name' => 'BRACU Computer Club',
            ]
        );

        // Media Item 1: YouTube Video in Album
        $item1 = GalleryItem::firstOrCreate(
            ['caption' => 'BRACU Hackathon 2026 Official Aftermovie & Highlights'],
            [
                'gallery_album_id' => $hackathonAlbum->id,
                'user_id' => $admin->id,
                'type' => 'video',
                'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'youtube_video_id' => 'dQw4w9WgXcQ',
                'description' => 'Relive the high-energy pitching rounds and final awards ceremony with our teams and industry judges.',
                'tags' => 'hackathon,bracu,techfest,aftermovie',
                'is_hidden' => false,
            ]
        );

        // Media Item 2: Award Ceremony Photo placeholder / memory
        $item2 = GalleryItem::firstOrCreate(
            ['caption' => 'Champions Trophy Presentation - Team ByteCraft'],
            [
                'gallery_album_id' => $hackathonAlbum->id,
                'user_id' => $donorUser->id,
                'type' => 'video',
                'youtube_url' => 'https://www.youtube.com/watch?v=9bZkp7q19f0',
                'youtube_video_id' => '9bZkp7q19f0',
                'description' => 'Team ByteCraft taking home the championship trophy with their innovative healthcare diagnostic platform.',
                'tags' => 'winners,champions,cse',
                'is_hidden' => false,
            ]
        );

        // 2. Album 2: Club Fair
        $clubFairAlbum = GalleryAlbum::firstOrCreate(
            ['title' => 'Club Fair & Cultural Celebration Fall 2026'],
            [
                'user_id' => $student->id,
                'description' => 'Welcoming new students with vibrant club stalls, musical performances, and campus tours.',
                'album_type' => 'official_club',
                'category' => 'Club Fair',
                'semester' => 'Fall',
                'year' => 2026,
                'department' => null,
                'club_name' => 'Cultural Club & Leadership Forum',
            ]
        );

        $item3 = GalleryItem::firstOrCreate(
            ['caption' => 'Acoustic Performance at the Cafeteria Rooftop'],
            [
                'gallery_album_id' => $clubFairAlbum->id,
                'user_id' => $student->id,
                'type' => 'video',
                'youtube_url' => 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                'youtube_video_id' => 'kJQP7kiw5Fk',
                'description' => 'Sunset acoustic performance by the BRACU Music Club during the club fair opening evening.',
                'tags' => 'music,clubfair,campuslife',
                'is_hidden' => false,
            ]
        );

        // Likes & Comments
        GalleryLike::firstOrCreate([
            'user_id' => $student->id,
            'gallery_item_id' => $item1->id,
        ]);
        GalleryLike::firstOrCreate([
            'user_id' => $donorUser->id,
            'gallery_item_id' => $item1->id,
        ]);

        GalleryComment::firstOrCreate(
            [
                'user_id' => $student->id,
                'gallery_item_id' => $item1->id,
                'content' => 'What an incredible event! Can not wait for the next edition.',
            ]
        );

        GalleryComment::firstOrCreate(
            [
                'user_id' => $donorUser->id,
                'gallery_item_id' => $item1->id,
                'content' => 'Proud to be part of the organizing team!',
            ]
        );
    }
}
