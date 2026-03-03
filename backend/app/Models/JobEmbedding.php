<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobEmbedding extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'embedding_vector',
        'model_version',
    ];

    protected $casts = [
        'embedding_vector' => 'array',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function scopeForJob($query, int $jobId)
    {
        return $query->where('job_id', $jobId);
    }

    public function scopeByModelVersion($query, string $version)
    {
        return $query->where('model_version', $version);
    }
}
