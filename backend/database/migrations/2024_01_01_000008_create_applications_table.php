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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('job_id');
            $table->unsignedBigInteger('resume_id');
            $table->text('cover_letter')->nullable();
            $table->integer('match_score')->nullable();
            $table->json('match_components')->nullable();
            $table->json('skill_gaps')->nullable();
            $table->integer('ats_score_at_apply')->nullable();
            $table->enum('status', ['pending', 'shortlisted', 'rejected', 'hired', 'withdrawn'])->default('pending');
            $table->text('recruiter_notes')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->foreign('resume_id')->references('id')->on('resumes');
            $table->unique(['user_id', 'job_id']);
            $table->index('user_id');
            $table->index('job_id');
            $table->index('status');
            $table->index('match_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
