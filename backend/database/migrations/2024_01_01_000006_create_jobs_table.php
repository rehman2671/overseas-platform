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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('recruiter_id');
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description');
            $table->longText('requirements')->nullable();
            $table->longText('responsibilities')->nullable();
            $table->string('country', 100);
            $table->string('city', 100)->nullable();
            $table->enum('job_type', ['full_time', 'part_time', 'contract', 'internship'])->default('full_time');
            $table->enum('work_mode', ['on_site', 'remote', 'hybrid'])->default('on_site');
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->string('salary_currency', 3)->default('USD');
            $table->enum('salary_period', ['hourly', 'monthly', 'yearly'])->default('yearly');
            $table->string('visa_type', 100)->nullable();
            $table->boolean('visa_sponsorship')->default(false);
            $table->integer('experience_required')->default(0);
            $table->integer('experience_max')->nullable();
            $table->string('education_required')->nullable();
            $table->json('skills_required')->nullable();
            $table->json('skills_nice_to_have')->nullable();
            $table->json('tools_required')->nullable();
            $table->json('languages_required')->nullable();
            $table->json('benefits')->nullable();
            $table->enum('status', ['draft', 'active', 'paused', 'closed', 'expired'])->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            $table->integer('application_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->foreign('recruiter_id')->references('id')->on('recruiters')->onDelete('cascade');
            $table->index('status');
            $table->index('country');
            $table->index('featured');
            $table->index('expires_at');
            $table->fullText(['title', 'description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
