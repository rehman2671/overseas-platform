<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationWithdrawnNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Application $application)
    {
        $this->onQueue('notifications');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $applicant = $this->application->user;
        $job = $this->application->job;

        return (new MailMessage)
            ->subject("Application Withdrawn - {$job->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("The applicant has withdrawn their application.")
            ->line("**Applicant:** {$applicant->name}")
            ->line("**Position:** {$job->title}")
            ->line("**Company:** {$job->company}")
            ->line("**Withdrawal Reason:** " . ($this->application->withdrawn_reason ?? 'No reason provided'))
            ->action('View All Applications', route('recruiter.applications.index', ['job_id' => $job->id]))
            ->line('Thank you for using our platform.')
            ->markdown('notifications.application-withdrawn');
    }
}
