<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $json = file_get_contents('./storage/data/dass_questions.json');
        $parsedJson = json_decode($json, true);

        $questions = $parsedJson['questions'];

        foreach ($questions as $questionType => $questionList) {
            foreach ($questionList as $question) {
                DB::table('questions')->insert([
                    'question' => $question,
                    'question_type' => $questionType,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }
    }
}
