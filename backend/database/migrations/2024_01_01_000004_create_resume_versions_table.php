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
        Schema::create('resume_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_id');
            $table->integer('version_number');
            $table->json('sections_json');
            $table->integer('ats_score')->nullable();
            $table->text('change_summary')->nullable();
            $table->boolean('created_by_ai')->default(false);
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('resume_id')->references('id')->on('resumes')->onDelete('cascade');
            $table->index(['resume_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resume_versions');
    }
};
