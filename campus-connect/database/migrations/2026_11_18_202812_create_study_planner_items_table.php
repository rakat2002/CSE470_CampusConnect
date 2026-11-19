<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_planner_items', function (Blueprint $table) {
            $table->id();

            // Connect each note or task to its student
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Note or Task
            $table->enum('type', ['note', 'task']);

            // Common information
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('course_code')->nullable();

            // Task information
            $table->enum('priority', ['low', 'medium', 'high'])->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('is_completed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_planner_items');
    }
};