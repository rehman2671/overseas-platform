<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\Resume;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        
        $applications = $user->applications()
            ->with(['job.recruiter.user', 'resume'])
            ->orderBy('applied_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        // Check if user can apply
        if (!$user->canApply()) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached your monthly application limit. Upgrade to Pro for unlimited applications.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:jobs,id',
            'resume_id' => 'required|exists:resumes,id',
            'cover_letter' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job = Job::active()->findOrFail($request->job_id);
        $resume = Resume::where('user_id', $user->id)->findOrFail($request->resume_id);

        // Check if already applied
        $existingApplication = Application::where('user_id', $user->id)
            ->where('job_id', $job->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'You have already applied for this job'
            ], 400);
        }

        // Calculate match score
        $matchResult = $this->aiService->calculateDetailedMatch($resume, $job);

        // Auto-optimize resume for premium users
        $optimizedResumeId = $resume->id;
        if ($user->plan_type === 'premium' && $matchResult['score'] < 85) {
            $optimized = $this->aiService->optimizeResume($resume, $job);
            
            // Create optimized version
            $optimizedResume = $resume->duplicate($resume->title . ' - Optimized');
            $optimizedResume->update([
                'sections_json' => $optimized['sections_json'],
                'summary' => $optimized['summary'] ?? $resume->summary,
                'skills' => $optimized['skills'] ?? $resume->skills,
                'experience' => $optimized['experience'] ?? $resume->experience,
                'is_optimized' => true,
                'optimized_for_job_id' => $job->id,
            ]);
            
            $optimizedResumeId = $optimizedResume->id;
            
            // Recalculate match score with optimized resume
            $matchResult = $this->aiService->calculateDetailedMatch($optimizedResume, $job);
        }

        $application = Application::create([
            'user_id' => $user->id,
            'job_id' => $job->id,
            'resume_id' => $optimizedResumeId,
            'cover_letter' => $request->cover_letter,
            'match_score' => $matchResult['score'],
            'match_components' => $matchResult['components'],
            'skill_gaps' => $matchResult['skill_gaps'],
            'ats_score_at_apply' => $resume->ats_score,
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        // Log activity
        \App\Models\UserActivity::log(
            $user->id,
            'job_applied',
            'job',
            $job->id,
            ['match_score' => $matchResult['score']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully',
            'data' => [
                'application' => $application->load(['job', 'resume']),
                'match_score' => $matchResult['score'],
                'skill_gaps' => $matchResult['skill_gaps'],
            ]
        ], 201);
    }

    public function show($id)
    {
        $user = auth()->user();
        
        $application = $user->applications()
            ->with(['job.recruiter.user', 'resume'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    public function withdraw($id)
    {
        $user = auth()->user();
        
        $application = $user->applications()
            ->where('status', 'pending')
            ->findOrFail($id);

        $application->withdraw();

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn successfully'
        ]);
    }

    // Recruiter methods
    public function jobApplications(Request $request, $jobId)
    {
        $user = auth()->user();
        
        if (!$user->isRecruiter()) {
            return response()->json([
                'success' => false,
                'message' => 'Only recruiters can view applications'
            ], 403);
        }

        $job = Job::whereHas('recruiter', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($jobId);

        $query = Application::with(['user', 'resume'])
            ->where('job_id', $job->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by match score
        if ($request->has('min_match_score')) {
            $query->where('match_score', '>=', $request->min_match_score);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'applied_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sort_by, $sortOrder);

        // AI Shortlist - sort by match score
        if ($request->has('ai_shortlist')) {
            $query->orderBy('match_score', 'desc');
        }

        $applications = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = auth()->user();
        
        if (!$user->isRecruiter()) {
            return response()->json([
                'success' => false,
                'message' => 'Only recruiters can update application status'
            ], 403);
        }

        $application = Application::whereHas('job.recruiter', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:shortlisted,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->status === 'shortlisted') {
            $application->shortlist($request->notes);
        } else {
            $application->reject($request->notes);
        }

        // TODO: Send notification to applicant

        return response()->json([
            'success' => true,
            'message' => 'Application status updated successfully',
            'data' => $application
        ]);
    }

    public function stats(Request $request)
    {
        $user = auth()->user();
        
        if ($user->isRecruiter()) {
            // Recruiter stats
            $recruiter = $user->recruiter;
            
            $stats = [
                'total_jobs' => $recruiter->jobs()->count(),
                'active_jobs' => $recruiter->activeJobs()->count(),
                'total_applications' => Application::whereHas('job', function ($q) use ($recruiter) {
                    $q->where('recruiter_id', $recruiter->id);
                })->count(),
                'pending_applications' => Application::whereHas('job', function ($q) use ($recruiter) {
                    $q->where('recruiter_id', $recruiter->id);
                })->where('status', 'pending')->count(),
                'shortlisted_applications' => Application::whereHas('job', function ($q) use ($recruiter) {
                    $q->where('recruiter_id', $recruiter->id);
                })->where('status', 'shortlisted')->count(),
                'average_match_score' => Application::whereHas('job', function ($q) use ($recruiter) {
                    $q->where('recruiter_id', $recruiter->id);
                })->avg('match_score'),
            ];
        } else {
            // Job seeker stats
            $stats = [
                'total_applications' => $user->applications()->count(),
                'pending_applications' => $user->applications()->where('status', 'pending')->count(),
                'shortlisted_applications' => $user->applications()->where('status', 'shortlisted')->count(),
                'rejected_applications' => $user->applications()->where('status', 'rejected')->count(),
                'average_match_score' => $user->applications()->avg('match_score'),
                'saved_jobs' => $user->savedJobs()->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
