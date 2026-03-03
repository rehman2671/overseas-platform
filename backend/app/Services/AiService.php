<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Resume;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AiService
{
    protected $aiServiceUrl;
    protected $timeout;

    public function __construct()
    {
        $this->aiServiceUrl = config('services.ai.url', 'http://ai-service:5000');
        $this->timeout = 60;
    }

    /**
     * Parse resume PDF/DOCX to structured data
     */
    public function parseResume($file): array
    {
        $response = Http::timeout($this->timeout)
            ->attach('file', file_get_contents($file->getPathname()), $file->getClientOriginalName())
            ->post("{$this->aiServiceUrl}/parse_resume");

        if ($response->failed()) {
            throw new \Exception('AI service failed to parse resume: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Extract structured data from job description
     */
    public function extractJobDescription(string $jobDescription): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/extract_jd", [
                'job_description' => $jobDescription,
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to extract JD: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Calculate detailed match score between resume and job
     */
    public function calculateDetailedMatch(Resume $resume, Job $job): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/calculate_match", [
                'resume' => [
                    'id' => $resume->id,
                    'skills' => $resume->skills ?? [],
                    'experience' => $resume->experience ?? [],
                    'summary' => $resume->summary ?? '',
                    'full_text' => $resume->full_text,
                    'total_experience_years' => $resume->total_experience_years,
                ],
                'job' => $job->toMatchArray(),
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to calculate match: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Calculate simple match score
     */
    public function calculateMatchScore(Resume $resume, Job $job): int
    {
        $result = $this->calculateDetailedMatch($resume, $job);
        return (int) ($result['score'] ?? 0);
    }

    /**
     * Calculate ATS score for resume
     */
    public function calculateAtsScore(Resume $resume): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/calculate_ats", [
                'resume' => [
                    'sections_json' => $resume->sections_json,
                    'skills' => $resume->skills ?? [],
                    'experience' => $resume->experience ?? [],
                    'summary' => $resume->summary ?? '',
                    'full_text' => $resume->full_text,
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to calculate ATS score: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Optimize resume for a specific job
     */
    public function optimizeResume(Resume $resume, Job $job): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/optimize_resume", [
                'resume' => [
                    'sections_json' => $resume->sections_json,
                    'skills' => $resume->skills ?? [],
                    'experience' => $resume->experience ?? [],
                    'summary' => $resume->summary ?? '',
                    'education' => $resume->education ?? [],
                ],
                'job' => $job->toMatchArray(),
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to optimize resume: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Detect skill gaps between resume and job
     */
    public function detectSkillGaps(Resume $resume, Job $job): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/detect_skill_gaps", [
                'resume_skills' => $resume->skills ?? [],
                'job_skills' => $job->skills_required ?? [],
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to detect skill gaps: ' . $response->body());
        }

        return $response->json('skill_gaps', []);
    }

    /**
     * Suggest improvements for resume
     */
    public function suggestImprovements(Resume $resume): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/suggest_improvements", [
                'resume' => [
                    'sections_json' => $resume->sections_json,
                    'ats_score' => $resume->ats_score,
                    'ats_feedback' => $resume->ats_feedback,
                ],
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to suggest improvements: ' . $response->body());
        }

        return $response->json('suggestions', []);
    }

    /**
     * Generate embedding vector for resume
     */
    public function generateResumeEmbedding(Resume $resume): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->aiServiceUrl}/generate_embedding", [
                    'text' => $resume->full_text,
                    'type' => 'resume',
                    'id' => $resume->id,
                ]);

            if ($response->successful()) {
                $embedding = $response->json('embedding');
                
                // Store embedding
                \App\Models\ResumeEmbedding::updateOrCreate(
                    ['resume_id' => $resume->id],
                    ['embedding_vector' => $embedding, 'model_version' => 'v1']
                );

                return $embedding;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to generate resume embedding: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Generate embedding vector for job
     */
    public function generateJobEmbedding(Job $job): ?array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->aiServiceUrl}/generate_embedding", [
                    'text' => $job->full_text,
                    'type' => 'job',
                    'id' => $job->id,
                ]);

            if ($response->successful()) {
                $embedding = $response->json('embedding');
                
                // Store embedding
                \App\Models\JobEmbedding::updateOrCreate(
                    ['job_id' => $job->id],
                    ['embedding_vector' => $embedding, 'model_version' => 'v1']
                );

                return $embedding;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to generate job embedding: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Calculate semantic similarity between two embeddings
     */
    public function calculateSemanticSimilarity(array $embedding1, array $embedding2): float
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/semantic_similarity", [
                'embedding1' => $embedding1,
                'embedding2' => $embedding2,
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to calculate similarity: ' . $response->body());
        }

        return $response->json('similarity', 0);
    }

    /**
     * Calculate overseas readiness score
     */
    public function calculateOverseasReadiness(array $profile): array
    {
        $response = Http::timeout($this->timeout)
            ->post("{$this->aiServiceUrl}/overseas_readiness", [
                'profile' => $profile,
            ]);

        if ($response->failed()) {
            throw new \Exception('AI service failed to calculate overseas readiness: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Health check for AI service
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->aiServiceUrl}/health");

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
