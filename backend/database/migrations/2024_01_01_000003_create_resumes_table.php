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
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('template_id');
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->json('sections_json');
            $table->json('personal_info')->nullable();
            $table->text('summary')->nullable();
            $table->json('experience')->nullable();
            $table->json('education')->nullable();
            $table->json('skills')->nullable();
            $table->json('certifications')->nullable();
            $table->json('projects')->nullable();
            $table->json('languages')->nullable();
            $table->integer('ats_score')->nullable();
            $table->json('ats_feedback')->nullable();
            $table->integer('version_number')->default(1);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_optimized')->default(false);
            $table->unsignedBigInteger('optimized_for_job_id')->nullable();
            $table->string('pdf_url', 500)->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('download_count')->default(0);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('templates');
            $table->index('user_id');
            $table->index('is_default');
            $table->index('ats_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resumes');
    }
};
