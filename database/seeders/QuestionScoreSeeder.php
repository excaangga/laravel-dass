<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $psyUser = User::where('email', 'psy@test.com')->first();
        $questionTeamMember = $psyUser->profile->questionTeamMembers->first();

        $questions = Question::where('question_type', 'DASS21')->get();

        foreach ($questions as $question) {
            DB::table('question_scores')->insert([
                'question_team_member_id' => $questionTeamMember->id,
                'question_id' => $question->id,
                'depression_score' => 3,
                'anxiety_score' => 2,
                'stress_score' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
