<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'keywords',
        'country',
        'job_type',
        'experience_level',
        'salary_min',
        'frequency',
        'is_active',
        'last_sent_at',
    ];

    protected $casts = [
        'salary_min' => 'decimal:2',
        'is_active' => 'boolean',
        'last_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByFrequency($query, string $frequency)
    {
        return $query->where('frequency', $frequency);
    }

    public function scopeReadyToSend($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('last_sent_at')
              ->orWhereRaw('CASE 
                WHEN frequency = "daily" THEN last_sent_at <= DATE_SUB(NOW(), INTERVAL 1 DAY)
                WHEN frequency = "weekly" THEN last_sent_at <= DATE_SUB(NOW(), INTERVAL 7 DAY)
                WHEN frequency = "monthly" THEN last_sent_at <= DATE_SUB(NOW(), INTERVAL 1 MONTH)
              END');
        });
    }

    public function markAsSent(): void
    {
        $this->update(['last_sent_at' => now()]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }
}
