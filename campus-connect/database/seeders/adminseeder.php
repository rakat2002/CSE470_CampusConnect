<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@g.bracu.ac.bd'],
            [
                'name' => 'Campus Admin',
                'student_id' => '00000000',
                'department' => 'Administration',
                'password' => 'admin12345',
            ]
        );

        // role is NOT fillable, so nobody can make themselves admin from the register form
        $admin->forceFill(['role' => 'admin'])->save();
    }
}