<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_albums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('album_type')->default('personal'); // official_club, event, personal
            $table->string('category'); // Orientation, Club Fair, Hackathons, Cultural Programs, Workshops, Competitions, Farewell Programs, Campus Life
            $table->string('semester', 20)->default('Fall'); // Spring, Summer, Fall
            $table->unsignedSmallInteger('year')->default(2026);
            $table->string('department')->nullable();
            $table->string('club_name')->nullable();
            $table->string('cover_image')->nullable();
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gallery_album_id')->nullable()->constrained('gallery_albums')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10)->default('photo'); // photo, video
            $table->string('file_path')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('youtube_video_id', 30)->nullable();
            $table->string('caption');
            $table->text('description')->nullable();
            $table->string('tags')->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });

        Schema::create('gallery_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gallery_item_id')->constrained('gallery_items')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'gallery_item_id']);
        });

        Schema::create('gallery_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gallery_item_id')->constrained('gallery_items')->cascadeOnDelete();
            $table->text('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_comments');
        Schema::dropIfExists('gallery_likes');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('gallery_albums');
    }
};
