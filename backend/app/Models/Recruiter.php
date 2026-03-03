<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recruiter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'company_logo',
        'company_description',
        'website',
        'industry',
        'company_size',
        'location',
        'country',
        'verified',
        'verification_documents',
        'plan_type',
        'job_posts_limit',
        'job_posts_used',
        'featured_listings_remaining',
        'can_search_resumes',
    ];

    protected $casts = [
        'verification_documents' => 'array',
        'verified' => 'boolean',
        'can_search_resumes' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }

    public function activeJobs(): HasMany
    {
        return $this->hasMany(Job::class)->active();
    }

    public function canPostJob(): bool
    {
        return $this->job_posts_used < $this->job_posts_limit;
    }

    public function incrementJobPosts(): void
    {
        $this->increment('job_posts_used');
    }

    public function decrementJobPosts(): void
    {
        if ($this->job_posts_used > 0) {
            $this->decrement('job_posts_used');
        }
    }

    public function canFeatureJob(): bool
    {
        return $this->featured_listings_remaining > 0;
    }

    public function useFeaturedListing(): void
    {
        if ($this->featured_listings_remaining > 0) {
            $this->decrement('featured_listings_remaining');
        }
    }

    public function scopeVerified($query)
    {
        return $query->where('verified', true);
    }

    public function scopeByPlan($query, string $plan)
    {
        return $query->where('plan_type', $plan);
    }
}
