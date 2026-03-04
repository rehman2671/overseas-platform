<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class PasswordResetNotification extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset Your OverseasJob.in Password')
            ->greeting("Hello {$notifiable->name},")
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $this->resetUrl($notifiable))
            ->line('This password reset link will expire in 60 minutes.')
            ->line('')
            ->line('If you did not request a password reset, no further action is required.')
            ->line('')
            ->line('For your security, please do not share this link with anyone.')
            ->salutation("Best regards,\nThe OverseasJob.in Team");
    }
}
