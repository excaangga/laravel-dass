<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clientUser = User::where('email', 'cli@test.com')->first();
        $psychologistUser = User::where('email', 'psy@test.com')->first();

        $clientRole = Role::where('slug', 'cli')->first();
        $psychologistRole = Role::where('slug', 'psy')->first();

        DB::table('profiles')->insert([ 
            [
                'user_id' => $clientUser->id,
                'role_id' => $clientRole->id,
                'name' => 'Testing Client',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'user_id' => $psychologistUser->id,
                'role_id' => $psychologistRole->id,
                'name' => 'Testing Psychologist',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
