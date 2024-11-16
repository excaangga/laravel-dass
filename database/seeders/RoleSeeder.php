<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insert([ 
            [
                'slug' => 'cli',
                'name' => 'Client',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'slug' => 'psy',
                'name' => 'Psychologist',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
