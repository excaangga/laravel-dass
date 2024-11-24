<?php

namespace Database\Seeders;

use App\Models\QuestionTeam;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientScoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientUser = User::where('email', 'cli@test.com')->first();
        $clientProfile = $clientUser->profile;

        // to seed the table using an OWA team
        $questionTeam = QuestionTeam::where('code', 'timhadi1')->first();

        DB::table('client_scores')->insert([ 
            [
                'profile_id' => $clientProfile->id,
                'question_team_id' => $questionTeam->id,
                'question_type' => 'DASS21',
                'depression_score' => 7,
                'anxiety_score' => 7,
                'stress_score' => 5,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
