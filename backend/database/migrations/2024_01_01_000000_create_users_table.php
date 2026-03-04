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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password_hash');
            $table->enum('role', ['job_seeker', 'recruiter', 'admin'])->default('job_seeker');
            $table->string('avatar', 500)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('location')->nullable();
            $table->string('country', 100)->nullable();
            $table->unsignedBigInteger('subscription_id')->nullable();
            $table->enum('subscription_status', ['active', 'expired', 'cancelled'])->nullable();
            $table->enum('plan_type', ['free', 'pro', 'premium'])->default('free');
            $table->timestamp('plan_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            
            $table->index('email');
            $table->index('role');
            $table->index('subscription_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
