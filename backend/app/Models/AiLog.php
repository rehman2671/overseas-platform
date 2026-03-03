<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'request_type',
        'input_data',
        'output_data',
        'processing_time_ms',
        'model_version',
        'status',
        'error_message',
        'ip_address',
    ];

    protected $casts = [
        'input_data' => 'array',
        'output_data' => 'array',
        'processing_time_ms' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('request_type', $type);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'error');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeSlowQueries($query, int $thresholdMs = 5000)
    {
        return $query->where('processing_time_ms', '>', $thresholdMs);
    }

    public static function log(string $type, array $input, array $output, int $processingTime, string $modelVersion = 'v1', int $userId = null, string $ipAddress = null): self
    {
        return self::create([
            'user_id' => $userId,
            'request_type' => $type,
            'input_data' => $input,
            'output_data' => $output,
            'processing_time_ms' => $processingTime,
            'model_version' => $modelVersion,
            'status' => 'success',
            'ip_address' => $ipAddress,
        ]);
    }

    public static function logError(string $type, array $input, string $errorMessage, int $processingTime = 0, string $modelVersion = 'v1', int $userId = null, string $ipAddress = null): self
    {
        return self::create([
            'user_id' => $userId,
            'request_type' => $type,
            'input_data' => $input,
            'output_data' => null,
            'processing_time_ms' => $processingTime,
            'model_version' => $modelVersion,
            'status' => 'error',
            'error_message' => $errorMessage,
            'ip_address' => $ipAddress,
        ]);
    }
}
