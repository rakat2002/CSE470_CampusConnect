
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('department');
            $table->string('designation')->nullable();
            $table->string('email')->nullable();
            $table->string('office_location')->nullable();
            $table->string('consultation_days')->nullable();
            $table->string('consultation_hours')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty_profiles');
    }
};
