<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionTeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('question_teams')->insert([ 
            [
                'name' => 'Tim Pak Hadi 1',
                'code' => 'timhadi1',
                'method_type' => 'OWA',
                'is_published' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Tim Pak Joko 1',
                'code' => 'timjoko1',
                'method_type' => 'OWA',
                'is_published' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Tim Pak Hadi 2',
                'code' => 'timhadi2',
                'method_type' => 'IOWA',
                'is_published' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'Tim Pak Joko 2',
                'code' => 'timjoko2',
                'method_type' => 'IOWA',
                'is_published' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }
}
