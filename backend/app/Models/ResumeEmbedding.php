<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeEmbedding extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id',
        'embedding_vector',
        'model_version',
    ];

    protected $casts = [
        'embedding_vector' => 'array',
    ];

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function scopeForResume($query, int $resumeId)
    {
        return $query->where('resume_id', $resumeId);
    }

    public function scopeByModelVersion($query, string $version)
    {
        return $query->where('model_version', $version);
    }
}
