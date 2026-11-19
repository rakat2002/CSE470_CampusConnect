<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collaboration_posts', function (Blueprint $table) {
            $table->id();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->string('title');
$table->text('description');
$table->string('activity_type');
$table->string('required_skills');
$table->string('department');
$table->string('course_code')->nullable();
$table->string('section')->nullable();
$table->unsignedInteger('teammates_needed');
$table->string('status')->default('open');
$table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collaboration_posts');
    }
};
