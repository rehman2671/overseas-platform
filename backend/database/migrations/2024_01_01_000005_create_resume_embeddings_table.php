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
        Schema::create('resume_embeddings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_id');
            $table->json('embedding_vector');
            $table->string('model_version')->default('v1');
            $table->timestamps();
            
            $table->foreign('resume_id')->references('id')->on('resumes')->onDelete('cascade');
            $table->index('resume_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resume_embeddings');
    }
};
