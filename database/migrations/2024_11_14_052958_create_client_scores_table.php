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
        Schema::create('client_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_team_id')->constrained()->onDelete('cascade');
            $table->enum('question_type', ['DASS21', 'DASS42']);
            $table->decimal('depression_score', 13, 11);
            $table->decimal('anxiety_score', 13, 11);
            $table->decimal('stress_score', 13, 11);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_scores');
    }
};
