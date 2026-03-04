<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('jobs')->truncate();

        $now = now();
        $jobs = [
            [
                'title' => 'Software Engineer',
                'description' => 'Looking for an experienced software engineer to work on our platform.',
                'company' => 'Acme Corp',
                'location' => 'Remote',
                'status' => 'open',
                'salary_min' => 60000,
                'salary_max' => 90000,
                'currency' => 'USD',
                'posted_at' => $now,
                'expires_at' => $now->copy()->addWeeks(4),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Data Analyst',
                'description' => 'Seeking a data analyst familiar with SQL and Python.',
                'company' => 'DataWorks',
                'location' => 'New York, NY',
                'status' => 'open',
                'salary_min' => 50000,
                'salary_max' => 70000,
                'currency' => 'USD',
                'posted_at' => $now->copy()->subDays(3),
                'expires_at' => $now->copy()->addWeeks(2),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Product Manager',
                'description' => 'Experienced PM to lead cross-functional teams.',
                'company' => 'Innovate LLC',
                'location' => 'San Francisco, CA',
                'status' => 'open',
                'salary_min' => 80000,
                'salary_max' => 120000,
                'currency' => 'USD',
                'posted_at' => $now->copy()->subWeek(),
                'expires_at' => $now->copy()->addWeeks(6),
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('jobs')->insert($jobs);
    }
}
