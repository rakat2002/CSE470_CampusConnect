<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DonorDemoSeeder extends Seeder
{
    public function run(): void
    {
        // [name, student id, dept, blood group, area, available?, last donation]
        $people = [
            ['Rahim Uddin',  '20101001', 'CSE', 'B+', 'Mohakhali', true,  null],
            ['Karima Akter', '20101002', 'EEE', 'B+', 'Badda',     true,  now()->subDays(200)->toDateString()],
            ['Sadia Islam',  '20101003', 'BBA', 'O+', 'Gulshan',   true,  null],
            ['Tanvir Hasan', '20101004', 'CSE', 'B+', 'Mohakhali', true,  now()->subDays(30)->toDateString()], // inside 120-day gap -> hidden
            ['Nusrat Jahan', '20101005', 'ARC', 'B+', 'Banani',    false, null],                               // unavailable -> hidden
        ];

        foreach ($people as [$name, $sid, $dept, $group, $area, $available, $last]) {
            $user = User::firstOrCreate(
                ['student_id' => $sid],
                ['name' => $name, 'email' => "{$sid}@demo.test", 'department' => $dept, 'password' => 'password123']
            );

                        $user->donor()->updateOrCreate([], [
                'blood_group' => $group,
                'area' => $area,
                'phone' => '01700000'.substr($sid, -3),
                'is_available' => $available,
                'last_donation_date' => $last,
                'approval_status' => 'approved',
            ]);
        }
    }
}