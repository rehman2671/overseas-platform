<?php

namespace App\Jobs;

use App\Models\JobAlert;
use App\Models\Job;
use App\Mail\JobAlertMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendJobAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Starting job alert processing');

        // Get all active job alerts that need to be sent
        $alerts = $this->getAlertsToSend();

        Log::info("Found {$alerts->count()} job alerts to process");

        foreach ($alerts as $alert) {
            try {
                $this->processAlert($alert);
            } catch (\Exception $e) {
                Log::error("Failed to process job alert {$alert->id}: " . $e->getMessage());
                // Continue processing other alerts
            }
        }

        Log::info('Job alert processing completed');
    }

    /**
     * Get job alerts that need to be sent based on their frequency.
     */
    private function getAlertsToSend()
    {
        $now = Carbon::now();

        return JobAlert::active()
            ->where(function ($query) use ($now) {
                // Daily alerts: sent more than 24 hours ago or never sent
                $query->where('frequency', 'daily')
                      ->where(function ($q) use ($now) {
                          $q->whereNull('last_sent_at')
                            ->orWhere('last_sent_at', '<=', $now->copy()->subDay());
                      });

                // Weekly alerts: sent more than 7 days ago or never sent
                $query->orWhere(function ($q) use ($now) {
                    $q->where('frequency', 'weekly')
                      ->where(function ($subQ) use ($now) {
                          $subQ->whereNull('last_sent_at')
                               ->orWhere('last_sent_at', '<=', $now->copy()->subWeek());
                      });
                });

                // Monthly alerts: sent more than 30 days ago or never sent
                $query->orWhere(function ($q) use ($now) {
                    $q->where('frequency', 'monthly')
                      ->where(function ($subQ) use ($now) {
                          $subQ->whereNull('last_sent_at')
                               ->orWhere('last_sent_at', '<=', $now->copy()->subMonth());
                      });
                });
            })
            ->get();
    }

    /**
     * Process a single job alert.
     */
    private function processAlert(JobAlert $alert): void
    {
        // Find matching jobs for this alert
        $matchingJobs = $this->findMatchingJobs($alert);

        if ($matchingJobs->isEmpty()) {
            Log::info("No matching jobs found for alert {$alert->id}");
            return;
        }

        // Send email with matching jobs
        Mail::to($alert->user->email)->send(new JobAlertMail($alert, $matchingJobs));

        // Update alert tracking
        $alert->update([
            'last_sent_at' => Carbon::now(),
            'sent_count' => $alert->sent_count + 1,
        ]);

        Log::info("Sent job alert {$alert->id} to {$alert->user->email} with {$matchingJobs->count()} jobs");
    }

    /**
     * Find jobs that match the alert criteria.
     */
    private function findMatchingJobs(JobAlert $alert): \Illuminate\Database\Eloquent\Collection
    {
        $query = Job::where('status', 'active')
                    ->where('is_active', true)
                    ->where('application_deadline', '>', Carbon::now());

        // Filter by keywords (search in title and description)
        if ($alert->keywords) {
            $keywords = explode(' ', $alert->keywords);
            foreach ($keywords as $keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('title', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%")
                      ->orWhere('requirements', 'like', "%{$keyword}%");
                });
            }
        }

        // Filter by country
        if ($alert->country) {
            $query->where('country', $alert->country);
        }

        // Filter by job type
        if ($alert->job_type) {
            $query->where('job_type', $alert->job_type);
        }

        // Filter by experience level
        if ($alert->experience_level) {
            $query->where('experience_level', $alert->experience_level);
        }

        // Filter by minimum salary
        if ($alert->salary_min) {
            $query->where('salary_max', '>=', $alert->salary_min);
        }

        // Limit to recent jobs (last 30 days) to avoid sending old jobs repeatedly
        $query->where('created_at', '>=', Carbon::now()->subDays(30));

        // Order by relevance (newest first)
        $query->orderBy('created_at', 'desc');

        // Limit to 10 jobs per alert to avoid overwhelming emails
        return $query->limit(10)->get();
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Job alert processing failed: ' . $exception->getMessage());
    }
}