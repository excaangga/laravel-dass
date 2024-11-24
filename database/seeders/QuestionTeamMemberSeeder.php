<?php

namespace Database\Seeders;

use App\Models\QuestionTeam;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionTeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $psyUser = User::where('email', 'psy@test.com')->first();
        $psyProfile = $psyUser->profile;

        $questionTeam = QuestionTeam::where('code', 'timhadi1')->first();

        DB::table('question_team_members')->insert([
            'profile_id' => $psyProfile->id,
            'question_team_id' => $questionTeam->id,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
