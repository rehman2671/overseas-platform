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
        Schema::create('recruiters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('company_name');
            $table->string('company_logo', 500)->nullable();
            $table->text('company_description')->nullable();
            $table->string('website')->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('company_size', 50)->nullable();
            $table->string('location')->nullable();
            $table->string('country', 100)->nullable();
            $table->boolean('verified')->default(false);
            $table->json('verification_documents')->nullable();
            $table->enum('plan_type', ['basic', 'standard', 'premium'])->default('basic');
            $table->integer('job_posts_limit')->default(1);
            $table->integer('job_posts_used')->default(0);
            $table->integer('featured_listings_remaining')->default(0);
            $table->boolean('can_search_resumes')->default(false);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('company_name');
            $table->index('verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recruiters');
    }
};
