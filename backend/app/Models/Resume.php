<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'template_id',
        'title',
        'slug',
        'sections_json',
        'personal_info',
        'summary',
        'experience',
        'education',
        'skills',
        'certifications',
        'projects',
        'languages',
        'ats_score',
        'ats_feedback',
        'version_number',
        'is_default',
        'is_optimized',
        'optimized_for_job_id',
        'pdf_url',
        'view_count',
        'download_count',
    ];

    protected $casts = [
        'sections_json' => 'array',
        'personal_info' => 'array',
        'experience' => 'array',
        'education' => 'array',
        'skills' => 'array',
        'certifications' => 'array',
        'projects' => 'array',
        'languages' => 'array',
        'ats_feedback' => 'array',
        'is_default' => 'boolean',
        'is_optimized' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($resume) {
            if (empty($resume->slug)) {
                $resume->slug = Str::slug($resume->title . '-' . uniqid());
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ResumeVersion::class)->orderBy('version_number', 'desc');
    }

    public function embedding(): HasOne
    {
        return $this->hasOne(ResumeEmbedding::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function getFullTextAttribute(): string
    {
        $text = '';
        
        if ($this->summary) {
            $text .= $this->summary . ' ';
        }
        
        if ($this->skills) {
            $text .= implode(' ', $this->skills) . ' ';
        }
        
        if ($this->experience) {
            foreach ($this->experience as $exp) {
                $text .= ($exp['title'] ?? '') . ' ';
                $text .= ($exp['company'] ?? '') . ' ';
                $text .= implode(' ', $exp['bullets'] ?? []) . ' ';
            }
        }
        
        return $text;
    }

    public function getSkillListAttribute(): array
    {
        return $this->skills ?? [];
    }

    public function getTotalExperienceYearsAttribute(): int
    {
        if (!$this->experience) {
            return 0;
        }

        $totalMonths = 0;
        foreach ($this->experience as $exp) {
            $start = isset($exp['start_date']) ? strtotime($exp['start_date']) : null;
            $end = isset($exp['end_date']) && $exp['end_date'] !== 'present' 
                ? strtotime($exp['end_date']) 
                : time();
            
            if ($start) {
                $months = ($end - $start) / (30 * 24 * 60 * 60);
                $totalMonths += $months;
            }
        }

        return (int) ($totalMonths / 12);
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    public function createVersion(string $changeSummary = '', bool $byAi = false): ResumeVersion
    {
        $newVersion = $this->versions()->create([
            'version_number' => $this->version_number + 1,
            'sections_json' => $this->sections_json,
            'ats_score' => $this->ats_score,
            'change_summary' => $changeSummary,
            'created_by_ai' => $byAi,
        ]);

        $this->update(['version_number' => $newVersion->version_number]);

        return $newVersion;
    }

    public function duplicate(string $newTitle): self
    {
        $duplicate = $this->replicate(['slug', 'is_default', 'ats_score', 'view_count', 'download_count']);
        $duplicate->title = $newTitle;
        $duplicate->slug = Str::slug($newTitle . '-' . uniqid());
        $duplicate->version_number = 1;
        $duplicate->save();

        return $duplicate;
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOptimized($query)
    {
        return $query->where('is_optimized', true);
    }

    public function scopeWithGoodAtsScore($query, int $minScore = 70)
    {
        return $query->where('ats_score', '>=', $minScore);
    }
}
