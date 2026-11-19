<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Part A: shared study materials
        Schema::create('study_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // uploader
            $table->string('title');
            $table->string('course_code');
            $table->string('topic');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('original_name');
            $table->string('file_type', 10);         // pdf, docx, pptx, jpg, png
            $table->unsignedInteger('file_size_kb');
            $table->boolean('is_hidden')->default(false); // hidden by admin
            $table->timestamps();
        });

        // Part B: questions and replies
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who asked
            $table->string('title');
            $table->text('details');
            $table->string('course_code');
            $table->string('topic')->nullable();
            $table->string('status')->default('open'); // open, answered
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });

        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who replied
            $table->text('content');
            $table->boolean('is_accepted')->default(false);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });

        // Reports from students about resources, questions and replies
        Schema::create('content_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // who reported
            $table->morphs('reportable');                                   // what was reported
            $table->string('reason', 500);
            $table->string('status')->default('pending'); // pending, resolved, dismissed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
        Schema::dropIfExists('replies');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('study_resources');
    }
};
