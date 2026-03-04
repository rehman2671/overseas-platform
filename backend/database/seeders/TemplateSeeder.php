<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('templates')->truncate();

        $templates = [];
        // We'll seed a few example templates. In a real project these would
        // be HTML/CSS stored in database or external files; for now we only
        // need the metadata so front end can display the option.
        for ($i = 1; $i <= 3; $i++) {
            $templates[] = [
                'name' => "Template $i",
                'description' => "Clean and simple resume template number $i.",
                'html_structure' => "<h1>{{name}}</h1><p>{{summary}}</p>",
                'css_styles' => "body { font-family: sans-serif; } h1 { color: #333; }",
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('templates')->insert($templates);
    }
}
