<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $application;
    protected $statusLabel;

    public function __construct(Application $application, string $statusLabel)
    {
        $this->application = $application;
        $this->statusLabel = $statusLabel;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $jobTitle = $this->application->job->title;
        $companyName = $this->application->job->recruiter->user->name ?? 'Recruiter';
        
        $mailMessage = (new MailMessage)
            ->subject("Application Status Update: {$jobTitle}")
            ->greeting("Hello {$notifiable->name},");

        if ($this->application->status === 'shortlisted') {
            $mailMessage->line("Great news! You've been **shortlisted** for the {$jobTitle} position at {$companyName}.")
                ->line("The recruiter is interested in your profile and may contact you soon.")
                ->action('View Application', route('applications.show', $this->application->id))
                ->line("Keep an eye on your inbox for further updates.");
        } elseif ($this->application->status === 'rejected') {
            $mailMessage->line("Thank you for applying to the {$jobTitle} position at {$companyName}.")
                ->line("Unfortunately, the recruiter has decided not to move forward with your application at this time.")
                ->action('View Application', route('applications.show', $this->application->id))
                ->line("We encourage you to continue applying to other positions that match your profile.");
        } elseif ($this->application->status === 'hired') {
            $mailMessage->line("Congratulations! You've been **hired** for the {$jobTitle} position at {$companyName}!")
                ->action('View Application', route('applications.show', $this->application->id))
                ->line("The recruiter will contact you with next steps shortly.");
        }

        return $mailMessage
            ->line('---')
            ->line('Position: ' . $jobTitle)
            ->line('Company: ' . $companyName)
            ->salutation("Best regards,\nThe OverseasJob.in Team");
    }
}
