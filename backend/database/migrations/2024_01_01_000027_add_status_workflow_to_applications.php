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
        Schema::table('applications', function (Blueprint $table) {
            $table->timestamp('status_changed_at')->nullable()->after('recruiter_notes');
            $table->text('withdrawn_reason')->nullable()->after('status_changed_at');
            $table->index('status_changed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['status_changed_at']);
            $table->dropColumn(['status_changed_at', 'withdrawn_reason']);
        });
    }
};
