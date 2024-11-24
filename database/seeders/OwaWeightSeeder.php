<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionTeam;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OwaWeightSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questionTeam = QuestionTeam::where('code', 'timhadi1')->first();

        $questions21 = Question::where('question_type', 'DASS21')->get();
        $questions42 = Question::where('question_type', 'DASS42')->get();

        foreach ($questions21 as $question) {
            DB::table('owa_weights')->insert([
                'question_team_id' => $questionTeam->id,
                'question_id' => $question->id,
                'depression_weight' => 0.5,
                'anxiety_weight' => 0.3333,
                'stress_weight' => 0.1666,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        foreach ($questions42 as $question) {
            DB::table('owa_weights')->insert([
                'question_team_id' => $questionTeam->id,
                'question_id' => $question->id,
                'depression_weight' => 0.5,
                'anxiety_weight' => 0.3333,
                'stress_weight' => 0.1666,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
