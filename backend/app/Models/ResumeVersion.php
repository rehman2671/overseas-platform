<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'version_number',
        'sections_json',
        'ats_score',
        'change_summary',
        'created_by_ai',
    ];

    protected $casts = [
        'sections_json' => 'array',
        'created_by_ai' => 'boolean',
    ];

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function scopeForResume($query, int $resumeId)
    {
        return $query->where('resume_id', $resumeId);
    }

    public function scopeLatest($query)
    {
        return $query->orderBy('version_number', 'desc');
    }

    public function scopeCreatedByAi($query)
    {
        return $query->where('created_by_ai', true);
    }
}
