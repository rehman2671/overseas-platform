<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $userType = $notifiable->isRecruiter() ? 'recruiter' : 'job seeker';

        return (new MailMessage)
            ->subject('Welcome to OverseasJob.in!')
            ->greeting("Welcome {$notifiable->name},")
            ->line("Thank you for joining OverseasJob.in, the leading platform for overseas job opportunities.")
            ->line('')
            ->when(!$notifiable->isRecruiter(), function ($message) {
                return $message
                    ->line('**For Job Seekers:**')
                    ->line('• Browse curated overseas job opportunities')
                    ->line('• Create and optimize your resume with AI')
                    ->line('• Get matched with roles that fit your profile')
                    ->line('• Track your applications in real-time')
                    ->line('');
            })
            ->when($notifiable->isRecruiter(), function ($message) {
                return $message
                    ->line('**For Recruiters:**')
                    ->line('• Post job openings instantly')
                    ->line('• Get AI-matched candidates')
                    ->line('• Manage applications efficiently')
                    ->line('• Access global talent pool')
                    ->line('');
            })
            ->action('Get Started', route('dashboard'))
            ->line('Need help? Check out our guides or contact support.')
            ->salutation("Best regards,\nThe OverseasJob.in Team");
    }
}
