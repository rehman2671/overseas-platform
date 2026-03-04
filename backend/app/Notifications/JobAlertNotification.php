<?php

namespace App\Notifications;

use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $jobs;
    protected $alertName;

    public function __construct($jobs, string $alertName = 'Job Alert')
    {
        $this->jobs = is_array($jobs) ? $jobs : [$jobs];
        $this->alertName = $alertName;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $mailMessage = (new MailMessage)
            ->subject("{$this->alertName}: {$this->jobs[0]->title} and {count($this->jobs) - 1} more matching jobs")
            ->greeting("Hello {$notifiable->name},")
            ->line('We found matching job opportunities for you based on your profile:')
            ->line('');

        foreach ($this->jobs as $job) {
            $mailMessage->line("**{$job->title}**")
                ->line("Company: {$job->recruiter->user->name}")
                ->line("Location: {$job->location} | Salary: {$job->salary_range}")
                ->action('View Job', route('jobs.show', $job->slug))
                ->line('');
        }

        return $mailMessage
            ->line('---')
            ->action('View All Matching Jobs', route('jobs.index'))
            ->line('You can manage your job alerts in your account settings.')
            ->salutation("Best regards,\nThe OverseasJob.in Team");
    }
}
