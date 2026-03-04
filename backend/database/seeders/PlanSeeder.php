<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // clear existing plans to avoid duplicates during repeated seeding
        DB::table('plans')->truncate();

        $plans = [
            [
                'name' => 'Free',
                'price_cents' => 0,
                'currency' => 'USD',
                'duration_days' => 0,
                'description' => 'Basic free tier with limited features',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pro',
                'price_cents' => 999, // $9.99
                'currency' => 'USD',
                'duration_days' => 30,
                'description' => 'Monthly subscription with full access',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Enterprise',
                'price_cents' => 4999, // $49.99
                'currency' => 'USD',
                'duration_days' => 365,
                'description' => 'Annual plan for businesses and recruiters',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plans')->insert($plans);
    }
}
