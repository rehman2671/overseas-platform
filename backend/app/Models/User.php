<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'role',
        'avatar',
        'phone',
        'location',
        'country',
        'subscription_id',
        'subscription_status',
        'plan_type',
        'plan_expires_at',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'plan_expires_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $appends = ['profile_completion'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'plan' => $this->plan_type,
        ];
    }

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function getProfileCompletionAttribute(): int
    {
        $fields = ['name', 'email', 'phone', 'location', 'country', 'avatar'];
        $filled = 0;
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $filled++;
            }
        }
        return (int) (($filled / count($fields)) * 100);
    }

    public function isJobSeeker(): bool
    {
        return $this->role === 'job_seeker';
    }

    public function isRecruiter(): bool
    {
        return $this->role === 'recruiter';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_status === 'active' && 
               ($this->plan_expires_at === null || $this->plan_expires_at->isFuture());
    }

    public function canAccessTemplate(string $category): bool
    {
        if ($category === 'free') return true;
        if ($this->plan_type === 'premium') return true;
        if ($this->plan_type === 'pro' && $category !== 'premium') return true;
        return false;
    }

    public function canApply(): bool
    {
        if ($this->plan_type === 'free') {
            $applicationsThisMonth = $this->applications()
                ->whereMonth('applied_at', now()->month)
                ->count();
            return $applicationsThisMonth < config('settings.free_applications_limit', 5);
        }
        return true;
    }

    public function recruiter(): HasOne
    {
        return $this->hasOne(Recruiter::class);
    }

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function savedJobs(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    public function jobAlerts(): HasMany
    {
        return $this->hasMany(JobAlert::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(UserActivity::class);
    }
}
