<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_editions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('edition_number')->unique();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->string('status')->default('draft'); // draft, published
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('newsletter_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('newsletter_edition_id')->nullable()->constrained('newsletter_editions')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('description');
            $table->string('category'); // Upcoming Events, Club Activities, Achievements, Research Updates, Academic Announcements, Opportunities
            $table->string('cover_image')->nullable();
            $table->string('relevant_links')->nullable();
            $table->string('event_link')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->text('admin_feedback')->nullable();
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('newsletter_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('newsletter_article_id')->constrained('newsletter_articles')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'newsletter_article_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_bookmarks');
        Schema::dropIfExists('newsletter_articles');
        Schema::dropIfExists('newsletter_editions');
    }
};
