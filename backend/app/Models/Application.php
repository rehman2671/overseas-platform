<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_id',
        'resume_id',
        'cover_letter',
        'match_score',
        'match_components',
        'skill_gaps',
        'ats_score_at_apply',
        'status',
        'recruiter_notes',
        'applied_at',
        'status_changed_at',
        'withdrawn_reason',
    ];

    protected $casts = [
        'match_components' => 'array',
        'skill_gaps' => 'array',
        'applied_at' => 'datetime',
        'status_changed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($application) {
            $application->job->incrementApplicationCount();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isShortlisted(): bool
    {
        return $this->status === 'shortlisted';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isHired(): bool
    {
        return $this->status === 'hired';
    }

    public function isWithdrawn(): bool
    {
        return $this->status === 'withdrawn';
    }

    public function canTransitionTo(string $newStatus): bool
    {
        $validTransitions = [
            'pending' => ['shortlisted', 'rejected', 'withdrawn'],
            'shortlisted' => ['rejected', 'hired', 'withdrawn'],
            'rejected' => [],
            'hired' => [],
            'withdrawn' => [],
        ];

        return in_array($newStatus, $validTransitions[$this->status] ?? []);
    }

    public function shortlist(string $notes = null): bool
    {
        if (!$this->canTransitionTo('shortlisted')) {
            return false;
        }

        $this->update([
            'status' => 'shortlisted',
            'recruiter_notes' => $notes ?? $this->recruiter_notes,
            'status_changed_at' => now(),
        ]);

        return true;
    }

    public function reject(string $notes = null): bool
    {
        if (!$this->canTransitionTo('rejected')) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'recruiter_notes' => $notes ?? $this->recruiter_notes,
            'status_changed_at' => now(),
        ]);

        return true;
    }

    public function hire(string $notes = null): bool
    {
        if (!$this->canTransitionTo('hired')) {
            return false;
        }

        $this->update([
            'status' => 'hired',
            'recruiter_notes' => $notes ?? $this->recruiter_notes,
            'status_changed_at' => now(),
        ]);

        return true;
    }

    public function withdraw(string $reason = null): bool
    {
        if (!$this->canTransitionTo('withdrawn')) {
            return false;
        }

        $this->update([
            'status' => 'withdrawn',
            'withdrawn_reason' => $reason,
            'status_changed_at' => now(),
        ]);

        return true;
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForJob($query, int $jobId)
    {
        return $query->where('job_id', $jobId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeShortlisted($query)
    {
        return $query->where('status', 'shortlisted');
    }

    public function scopeWithGoodMatch($query, int $minScore = 65)
    {
        return $query->where('match_score', '>=', $minScore);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('applied_at', '>=', now()->subDays($days));
    }
}
