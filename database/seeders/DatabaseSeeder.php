<?php

namespace Database\Seeders;

use Database\Seeders\RoleSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(ProfileSeeder::class);
        $this->call(QuestionSeeder::class);
        $this->call(QuestionTeamSeeder::class);
        $this->call(ClientScoreSeeder::class);
        $this->call(QuestionTeamMemberSeeder::class);
        $this->call(QuestionScoreSeeder::class);
        $this->call(OwaWeightSeeder::class);
    }
}
