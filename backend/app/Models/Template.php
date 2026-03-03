<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'description',
        'html_structure',
        'css_styles',
        'preview_image',
        'thumbnail_image',
        'is_active',
        'sort_order',
        'features',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }

    public function isFree(): bool
    {
        return $this->category === 'free';
    }

    public function isPro(): bool
    {
        return $this->category === 'pro';
    }

    public function isPremium(): bool
    {
        return $this->category === 'premium';
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeFree($query)
    {
        return $query->where('category', 'free');
    }

    public function scopePro($query)
    {
        return $query->where('category', 'pro');
    }

    public function scopePremium($query)
    {
        return $query->where('category', 'premium');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function render(array $data): string
    {
        $html = $this->html_structure;
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            $html = str_replace("{{{$key}}}", $value, $html);
        }

        return "<style>{$this->css_styles}</style>{$html}";
    }
}
