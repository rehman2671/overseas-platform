<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\Resume;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AiController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function parseResume(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,docx,doc|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $startTime = microtime(true);
        
        try {
            $file = $request->file('file');
            $parsed = $this->aiService->parseResume($file);

            $processingTime = (int) ((microtime(true) - $startTime) * 1000);

            // Log AI request
            \App\Models\AiLog::log(
                'parse_resume',
                ['filename' => $file->getClientOriginalName()],
                $parsed,
                $processingTime,
                'v1',
                auth()->id(),
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'data' => $parsed
            ]);
        } catch (\Exception $e) {
            $processingTime = (int) ((microtime(true) - $startTime) * 1000);
            
            \App\Models\AiLog::logError(
                'parse_resume',
                ['filename' => $request->file('file')->getClientOriginalName()],
                $e->getMessage(),
                $processingTime,
                'v1',
                auth()->id(),
                $request->ip()
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to parse resume',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function extractJd(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_description' => 'required|string|min:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $startTime = microtime(true);

        try {
            $extracted = $this->aiService->extractJobDescription($request->job_description);

            $processingTime = (int) ((microtime(true) - $startTime) * 1000);

            \App\Models\AiLog::log(
                'extract_jd',
                ['length' => strlen($request->job_description)],
                $extracted,
                $processingTime,
                'v1',
                auth()->id(),
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'data' => $extracted
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to extract JD',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function calculateMatch(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume_id' => 'required|exists:resumes,id',
            'job_id' => 'required|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);
        $job = Job::findOrFail($request->job_id);

        $startTime = microtime(true);

        try {
            $matchResult = $this->aiService->calculateDetailedMatch($resume, $job);

            $processingTime = (int) ((microtime(true) - $startTime) * 1000);

            // Log match calculation
            \App\Models\SemanticMatchLog::create([
                'resume_id' => $resume->id,
                'job_id' => $job->id,
                'match_score' => $matchResult['score'],
                'skill_score' => $matchResult['components']['skill_score'] ?? 0,
                'responsibility_score' => $matchResult['components']['responsibility_score'] ?? 0,
                'experience_score' => $matchResult['components']['experience_score'] ?? 0,
                'industry_score' => $matchResult['components']['industry_score'] ?? 0,
                'ats_score' => $matchResult['components']['ats_score'] ?? 0,
                'skill_gaps' => $matchResult['skill_gaps'],
                'model_version' => 'v1',
            ]);

            return response()->json([
                'success' => true,
                'data' => $matchResult
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate match',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function calculateAts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume_id' => 'required|exists:resumes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);

        try {
            $atsResult = $this->aiService->calculateAtsScore($resume);

            // Update resume with ATS score
            $resume->update([
                'ats_score' => $atsResult['score'],
                'ats_feedback' => $atsResult['feedback'],
            ]);

            return response()->json([
                'success' => true,
                'data' => $atsResult
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate ATS score',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function optimizeResume(Request $request)
    {
        $user = auth()->user();
        
        // Check plan access
        if ($user->plan_type === 'free') {
            return response()->json([
                'success' => false,
                'message' => 'Resume optimization requires Pro or Premium plan'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'resume_id' => 'required|exists:resumes,id',
            'job_id' => 'required|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);
        $job = Job::findOrFail($request->job_id);

        $startTime = microtime(true);

        try {
            $optimized = $this->aiService->optimizeResume($resume, $job);

            $processingTime = (int) ((microtime(true) - $startTime) * 1000);

            \App\Models\AiLog::log(
                'optimize_resume',
                ['resume_id' => $resume->id, 'job_id' => $job->id],
                ['changes_count' => count($optimized['changes'] ?? [])],
                $processingTime,
                'v1',
                $user->id,
                $request->ip()
            );

            return response()->json([
                'success' => true,
                'data' => $optimized
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to optimize resume',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function skillGap(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume_id' => 'required|exists:resumes,id',
            'job_id' => 'required|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);
        $job = Job::findOrFail($request->job_id);

        try {
            $skillGaps = $this->aiService->detectSkillGaps($resume, $job);

            return response()->json([
                'success' => true,
                'data' => [
                    'skill_gaps' => $skillGaps,
                    'missing_skills_count' => count($skillGaps),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to detect skill gaps',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function suggestImprovements(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'resume_id' => 'required|exists:resumes,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);

        try {
            $suggestions = $this->aiService->suggestImprovements($resume);

            return response()->json([
                'success' => true,
                'data' => $suggestions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate suggestions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
