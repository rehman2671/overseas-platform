<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'price',
        'currency',
        'duration_days',
        'features',
        'templates_access',
        'ai_optimizations',
        'resume_limit',
        'job_posts_limit',
        'can_feature_jobs',
        'can_search_resumes',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'can_feature_jobs' => 'boolean',
        'can_search_resumes' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    public function isForJobSeeker(): bool
    {
        return $this->type === 'job_seeker';
    }

    public function isForRecruiter(): bool
    {
        return $this->type === 'recruiter';
    }

    public function formattedPrice(): string
    {
        if ($this->isFree()) {
            return 'Free';
        }
        return sprintf('%s %s', $this->currency, number_format($this->price));
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForJobSeekers($query)
    {
        return $query->where('type', 'job_seeker');
    }

    public function scopeForRecruiters($query)
    {
        return $query->where('type', 'recruiter');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }
}
