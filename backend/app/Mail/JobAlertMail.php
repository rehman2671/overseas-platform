<?php

namespace App\Mail;

use App\Models\JobAlert;
use App\Models\Job;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public JobAlert $alert;
    public $jobs;

    /**
     * Create a new message instance.
     */
    public function __construct(JobAlert $alert, $jobs)
    {
        $this->alert = $alert;
        $this->jobs = $jobs;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Job Opportunities Matching Your Criteria - ' . $this->alert->frequency . ' Alert',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.job-alert',
            with: [
                'alert' => $this->alert,
                'jobs' => $this->jobs,
                'user' => $this->alert->user,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}