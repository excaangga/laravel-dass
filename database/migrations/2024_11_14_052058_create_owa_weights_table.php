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
        Schema::create('owa_weights', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_team_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->decimal('depression_weight', 12, 11);
            $table->decimal('anxiety_weight', 12, 11);
            $table->decimal('stress_weight', 12, 11);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owa_weights');
    }
};
