<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'recruiter_id',
        'title',
        'slug',
        'description',
        'requirements',
        'responsibilities',
        'country',
        'city',
        'job_type',
        'work_mode',
        'salary_min',
        'salary_max',
        'salary_currency',
        'salary_period',
        'visa_type',
        'visa_sponsorship',
        'experience_required',
        'experience_max',
        'education_required',
        'skills_required',
        'skills_nice_to_have',
        'tools_required',
        'languages_required',
        'benefits',
        'status',
        'featured',
        'featured_until',
        'application_count',
        'view_count',
        'expires_at',
    ];

    protected $casts = [
        'skills_required' => 'array',
        'skills_nice_to_have' => 'array',
        'tools_required' => 'array',
        'languages_required' => 'array',
        'benefits' => 'array',
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'visa_sponsorship' => 'boolean',
        'featured' => 'boolean',
        'featured_until' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($job) {
            if (empty($job->slug)) {
                $job->slug = Str::slug($job->title . '-' . uniqid());
            }
        });
    }

    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(Recruiter::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function embedding(): HasOne
    {
        return $this->hasOne(JobEmbedding::class);
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    public function getFullTextAttribute(): string
    {
        $text = $this->title . ' ';
        $text .= $this->description . ' ';
        $text .= $this->requirements . ' ';
        $text .= $this->responsibilities . ' ';
        
        if ($this->skills_required) {
            $text .= implode(' ', $this->skills_required) . ' ';
        }
        
        if ($this->tools_required) {
            $text .= implode(' ', $this->tools_required) . ' ';
        }
        
        return $text;
    }

    public function getSkillListAttribute(): array
    {
        return $this->skills_required ?? [];
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function incrementApplicationCount(): void
    {
        $this->increment('application_count');
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && 
               ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function isFeatured(): bool
    {
        return $this->featured && 
               ($this->featured_until === null || $this->featured_until->isFuture());
    }

    public function getSalaryRangeAttribute(): string
    {
        if (!$this->salary_min && !$this->salary_max) {
            return 'Not disclosed';
        }

        $currency = $this->salary_currency ?? 'USD';
        $period = $this->salary_period ?? 'yearly';

        if ($this->salary_min && $this->salary_max) {
            return sprintf('%s %s - %s %s', 
                $currency, 
                number_format($this->salary_min),
                $currency,
                number_format($this->salary_max)
            );
        }

        return sprintf('%s %s+ %s', 
            $currency,
            number_format($this->salary_min ?? $this->salary_max),
            $period
        );
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true)
            ->where(function ($q) {
                $q->whereNull('featured_until')
                  ->orWhere('featured_until', '>', now());
            });
    }

    public function scopeInCountry($query, string $country)
    {
        return $query->where('country', $country);
    }

    public function scopeWithVisaSponsorship($query)
    {
        return $query->where('visa_sponsorship', true);
    }

    public function scopeForExperience($query, int $years)
    {
        return $query->where(function ($q) use ($years) {
            $q->whereNull('experience_required')
              ->orWhere('experience_required', '<=', $years);
        });
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('description', 'LIKE', "%{$search}%")
              ->orWhereJsonContains('skills_required', $search);
        });
    }

    public function scopeFilterBySkills($query, array $skills)
    {
        foreach ($skills as $skill) {
            $query->whereJsonContains('skills_required', $skill);
        }
        return $query;
    }

    public function toMatchArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'skills' => $this->skills_required ?? [],
            'tools' => $this->tools_required ?? [],
            'experience_required' => $this->experience_required ?? 0,
            'country' => $this->country,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'responsibilities' => $this->responsibilities,
        ];
    }
}
