<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Custom commands
Artisan::command('cleanup:expired-jobs', function () {
    $count = \App\Models\Job::where('expires_at', '<', now())
        ->where('status', '!=', 'expired')
        ->update(['status' => 'expired']);
    
    $this->info("Expired {$count} jobs.");
})->purpose('Mark expired jobs as expired')->daily();

Artisan::command('cleanup:old-ai-logs', function () {
    $count = \App\Models\AiLog::where('created_at', '<', now()->subDays(90))->delete();
    $this->info("Deleted {$count} old AI logs.");
})->purpose('Clean up old AI logs')->weekly();
