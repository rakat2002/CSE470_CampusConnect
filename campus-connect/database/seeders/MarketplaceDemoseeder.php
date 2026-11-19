<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class MarketplaceDemoSeeder extends Seeder
{
    public function run(): void
    {
        // [seller student id, name, description, price, category, condition, status]
        $items = [
            ['20101001', 'Casio fx-991EX Calculator', 'Used for 2 semesters, works perfectly.', 1200, 'Electronics', 'Good', 'available'],
            ['20101002', 'Data Structures book (Cormen)', 'CLRS 3rd edition, some highlights.', 800, 'Books', 'Good', 'available'],
            ['20101003', 'Study table', 'Wooden table, good for hostel rooms.', 2500, 'Furniture', 'Fair', 'available'],
            ['20101001', 'Rice cooker', 'Small 1L cooker, perfect for hostel.', 1500, 'Hostel Items', 'Like New', 'available'],
            ['20101002', 'Old headphones', 'Already sold — should NOT appear in search.', 500, 'Electronics', 'Fair', 'sold'],
        ];

        foreach ($items as [$sid, $name, $desc, $price, $cat, $cond, $status]) {
            $user = User::where('student_id', $sid)->first();
            if (! $user) {
                continue; // run DonorDemoSeeder first (it creates these users)
            }

            $user->listings()->firstOrCreate(
                ['name' => $name],
                ['description' => $desc, 'price' => $price, 'category' => $cat, 'condition' => $cond, 'status' => $status]
            );
        }
    }
}