<?php

namespace Database\Seeders;

use App\Models\NewsletterArticle;
use App\Models\NewsletterEdition;
use App\Models\User;
use Illuminate\Database\Seeder;

class NewsletterDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@campusconnect.test')->first()
            ?? User::first();
        $student = User::where('email', 'student@campusconnect.test')->first()
            ?? User::first();

        // 1. Create Published Edition 1
        $edition1 = NewsletterEdition::firstOrCreate(
            ['edition_number' => 1],
            [
                'title' => 'Edition 1 - Welcome to Fall 2026',
                'summary' => 'Highlights from the semester kickoff, university tech competitions, research grants, and club enrollment fairs.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ]
        );

        // 2. Approved Articles in Edition 1
        $articles = [
            [
                'title' => 'BRACU Annual Tech Fest & Hackathon 2026 Announced',
                'category' => 'Upcoming Events',
                'description' => "The Department of Computer Science & Engineering is thrilled to announce the annual CampusConnect Tech Fest & 36-hour Hackathon, taking place next month at the university auditorium.\n\nStudents from all departments are encouraged to form multidisciplinary teams. Tracks include Smart Campus Systems, AI for Social Good, and Clean Energy Solutions. Over 500,000 BDT in prizes will be awarded alongside interview opportunities with leading software firms.",
                'event_link' => 'https://www.bracu.ac.bd/events/techfest-2026',
                'relevant_links' => 'https://hackathon.bracu.ac.bd',
                'views_count' => 142,
            ],
            [
                'title' => 'Robotics Club (ROBU) Wins 1st Runner-Up at International Tech Expo',
                'category' => 'Achievements',
                'description' => "Our university robotics team achieved an outstanding 1st Runner-Up finish at the International Autonomous Rover Challenge in Kuala Lumpur.\n\nThe team designed an autonomous agricultural rover equipped with computer vision for crop disease detection. Congratulations to all team members and faculty mentors who represented BRACU on the global stage!",
                'event_link' => null,
                'relevant_links' => 'https://robu.bracu.ac.bd/achievements',
                'views_count' => 89,
            ],
            [
                'title' => 'CSE Department AI Lab Receives International Research Grant',
                'category' => 'Research Updates',
                'description' => "The Natural Language Processing and Computer Vision research group at BRAC University has secured a $120,000 research grant to pioneer Low-Resource Language Translation models for regional dialects.\n\nUndergraduate students enrolled in thesis or research projects will have the opportunity to participate as funded research assistants.",
                'event_link' => null,
                'relevant_links' => 'https://research.bracu.ac.bd/nlp-lab',
                'views_count' => 110,
            ],
            [
                'title' => 'Google & Leading Tech Firms Fall 2026 Internship Fair Open',
                'category' => 'Opportunities',
                'description' => "The Office of Career Services & Alumni Relations (OCSAR) invites penultimate and final-year students to apply for summer and fall software engineering and data science internships.\n\nShortlisted candidates will participate in campus interviews next week. Ensure your LinkedIn and GitHub profiles are up to date.",
                'event_link' => 'https://ocsar.bracu.ac.bd/fairs/fall-2026',
                'relevant_links' => 'https://careers.google.com/students',
                'views_count' => 205,
            ],
        ];

        foreach ($articles as $art) {
            NewsletterArticle::firstOrCreate(
                ['title' => $art['title']],
                [
                    'newsletter_edition_id' => $edition1->id,
                    'user_id' => $admin->id,
                    'category' => $art['category'],
                    'description' => $art['description'],
                    'event_link' => $art['event_link'],
                    'relevant_links' => $art['relevant_links'],
                    'status' => 'approved',
                    'views_count' => $art['views_count'],
                    'published_at' => now()->subDays(3),
                ]
            );
        }

        // 3. Pending Submission for Testing Admin Approval
        NewsletterArticle::firstOrCreate(
            ['title' => 'BRACU Cultural Club Auditions for Fall Fest 2026'],
            [
                'newsletter_edition_id' => null,
                'user_id' => $student->id,
                'category' => 'Club Activities',
                'description' => "Calling all vocalists, musicians, dancers, and theater performers! The BRACU Cultural Club (BCC) is hosting open auditions for the upcoming Fall Cultural Night.\n\nAuditions will be held from 3:00 PM to 6:00 PM in Room UB0201. Please bring your student ID and be prepared for a 3-minute performance piece.",
                'event_link' => null,
                'relevant_links' => 'https://facebook.com/bracuculturalclub',
                'status' => 'pending',
                'views_count' => 0,
            ]
        );
    }
}
