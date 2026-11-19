<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaboration_invitations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('collaboration_post_id')
                ->constrained('collaboration_posts')
                ->cascadeOnDelete();

            // The invited student
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('status')->default('pending'); // pending, accepted, declined

            $table->timestamps();

            $table->unique(['collaboration_post_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_invitations');
    }
};
