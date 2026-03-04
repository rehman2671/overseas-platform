<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->enum('type', ['job_seeker', 'recruiter'])->index();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('INR');
            $table->integer('duration_days');
            $table->json('features');
            $table->enum('templates_access', ['free_only', 'all', 'premium'])->default('free_only');
            $table->integer('ai_optimizations')->default(0);
            $table->integer('resume_limit')->default(1);
            $table->integer('job_posts_limit')->default(0);
            $table->boolean('can_feature_jobs')->default(false);
            $table->boolean('can_search_resumes')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
