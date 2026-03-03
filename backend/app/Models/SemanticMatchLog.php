<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SemanticMatchLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'job_id',
        'match_score',
        'skill_score',
        'responsibility_score',
        'experience_score',
        'industry_score',
        'ats_score',
        'skill_gaps',
        'model_version',
    ];

    protected $casts = [
        'match_score' => 'decimal:2',
        'skill_score' => 'decimal:2',
        'responsibility_score' => 'decimal:2',
        'experience_score' => 'decimal:2',
        'industry_score' => 'decimal:2',
        'ats_score' => 'decimal:2',
        'skill_gaps' => 'array',
    ];

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function scopeForResume($query, int $resumeId)
    {
        return $query->where('resume_id', $resumeId);
    }

    public function scopeForJob($query, int $jobId)
    {
        return $query->where('job_id', $jobId);
    }

    public function scopeWithGoodMatch($query, float $minScore = 65)
    {
        return $query->where('match_score', '>=', $minScore);
    }

    public function scopeByModelVersion($query, string $version)
    {
        return $query->where('model_version', $version);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
