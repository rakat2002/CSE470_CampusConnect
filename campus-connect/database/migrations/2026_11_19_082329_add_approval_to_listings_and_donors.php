<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->string('rejection_reason')->nullable()->after('status');
        });

        Schema::table('donors', function (Blueprint $table) {
            $table->string('approval_status')->default('pending')->after('last_donation_date'); // pending, approved, rejected
            $table->string('rejection_reason')->nullable()->after('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });

        Schema::table('donors', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'rejection_reason']);
        });
    }
};