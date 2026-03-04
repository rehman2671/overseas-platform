<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\SavedJob;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        $query = Job::with('recruiter.user')
            ->active();

        // Filters
        if ($request->has('search')) {
            $query->search($request->search);
        }

        if ($request->has('country')) {
            $query->inCountry($request->country);
        }

        if ($request->has('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->has('work_mode')) {
            $query->where('work_mode', $request->work_mode);
        }

        if ($request->has('visa_sponsorship')) {
            $query->withVisaSponsorship();
        }

        if ($request->has('experience')) {
            $query->forExperience((int) $request->experience);
        }

        if ($request->has('skills')) {
            $skills = is_array($request->skills) ? $request->skills : explode(',', $request->skills);
            $query->filterBySkills($skills);
        }

        if ($request->has('min_salary')) {
            $query->where('salary_max', '>=', $request->min_salary)
                  ->orWhereNull('salary_max');
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Featured jobs first
        if ($request->has('featured_first')) {
            $query->orderByRaw('featured DESC, created_at DESC');
        }

        $perPage = $request->get('per_page', 15);
        $jobs = $query->paginate($perPage);

        // Add match score if user is authenticated and has default resume
        if (auth()->check()) {
            $user = auth()->user();
            $defaultResume = $user->resumes()->default()->first();
            
            if ($defaultResume) {
                foreach ($jobs as $job) {
                    $job->match_score = $this->aiService->calculateMatchScore($defaultResume, $job);
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    public function show($slug)
    {
        $job = Job::with('recruiter.user')
            ->where('slug', $slug)
            ->firstOrFail();

        $job->incrementViewCount();

        // Add match score if user is authenticated
        if (auth()->check()) {
            $user = auth()->user();
            $defaultResume = $user->resumes()->default()->first();
            
            if ($defaultResume) {
                $matchResult = $this->aiService->calculateDetailedMatch($defaultResume, $job);
                $job->match_score = $matchResult['score'];
                $job->match_breakdown = $matchResult['components'];
                $job->skill_gaps = $matchResult['skill_gaps'];
            }
        }

        // Check if job is saved
        if (auth()->check()) {
            $job->is_saved = SavedJob::where('user_id', auth()->id())
                ->where('job_id', $job->id)
                ->exists();
        }

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user->isRecruiter()) {
            return response()->json([
                'success' => false,
                'message' => 'Only recruiters can post jobs'
            ], 403);
        }

        $recruiter = $user->recruiter;

        if (!$recruiter->canPostJob()) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached your job posting limit. Upgrade your plan.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'country' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'job_type' => 'required|in:full_time,part_time,contract,internship',
            'work_mode' => 'required|in:on_site,remote,hybrid',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|gte:salary_min',
            'salary_currency' => 'nullable|string|size:3',
            'salary_period' => 'nullable|in:hourly,monthly,yearly',
            'visa_type' => 'nullable|string|max:100',
            'visa_sponsorship' => 'boolean',
            'experience_required' => 'nullable|integer|min:0',
            'experience_max' => 'nullable|integer|gte:experience_required',
            'education_required' => 'nullable|string|max:255',
            'skills_required' => 'nullable|array',
            'skills_nice_to_have' => 'nullable|array',
            'tools_required' => 'nullable|array',
            'languages_required' => 'nullable|array',
            'benefits' => 'nullable|array',
            'featured' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['recruiter_id'] = $recruiter->id;
        $data['status'] = 'active';

        // Handle featured job
        if ($request->featured && !$recruiter->canFeatureJob()) {
            return response()->json([
                'success' => false,
                'message' => 'No featured listings remaining. Upgrade your plan.'
            ], 403);
        }

        if ($request->featured) {
            $data['featured_until'] = now()->addDays(30);
            $recruiter->useFeaturedListing();
        }

        $job = Job::create($data);
        $recruiter->incrementJobPosts();

        // Generate job embedding for semantic matching
        $this->aiService->generateJobEmbedding($job);

        // Match with existing resumes and notify users
        $this->matchWithResumes($job);

        return response()->json([
            'success' => true,
            'message' => 'Job posted successfully',
            'data' => $job
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        
        $job = Job::whereHas('recruiter', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'country' => 'sometimes|string|max:100',
            'city' => 'nullable|string|max:100',
            'job_type' => 'sometimes|in:full_time,part_time,contract,internship',
            'work_mode' => 'sometimes|in:on_site,remote,hybrid',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric',
            'visa_sponsorship' => 'boolean',
            'experience_required' => 'nullable|integer|min:0',
            'skills_required' => 'nullable|array',
            'status' => 'sometimes|in:draft,active,paused,closed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job->update($request->all());

        // Update embedding
        $this->aiService->generateJobEmbedding($job);

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully',
            'data' => $job
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        
        $job = Job::whereHas('recruiter', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        // Soft delete - just change status
        $job->update(['status' => 'closed']);
        $job->recruiter->decrementJobPosts();

        return response()->json([
            'success' => true,
            'message' => 'Job closed successfully'
        ]);
    }

    public function recommended(Request $request)
    {
        $user = auth()->user();
        
        $defaultResume = $user->resumes()->default()->first();

        if (!$defaultResume) {
            return response()->json([
                'success' => false,
                'message' => 'Please create a resume first to get recommendations'
            ], 400);
        }

        // Get all active jobs
        $jobs = Job::active()
            ->with('recruiter.user')
            ->get();

        // Calculate match scores
        $matchedJobs = [];
        foreach ($jobs as $job) {
            $matchResult = $this->aiService->calculateDetailedMatch($defaultResume, $job);
            
            if ($matchResult['score'] >= config('settings.match_score_threshold', 65)) {
                $job->match_score = $matchResult['score'];
                $job->match_breakdown = $matchResult['components'];
                $matchedJobs[] = $job;
            }
        }

        // Sort by match score
        usort($matchedJobs, function ($a, $b) {
            return $b->match_score <=> $a->match_score;
        });

        // Paginate
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $offset = ($page - 1) * $perPage;
        $paginatedJobs = array_slice($matchedJobs, $offset, $perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'jobs' => $paginatedJobs,
                'total' => count($matchedJobs),
                'page' => $page,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function saveJob($id)
    {
        $user = auth()->user();
        
        $job = Job::active()->findOrFail($id);

        $savedJob = SavedJob::firstOrCreate([
            'user_id' => $user->id,
            'job_id' => $job->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job saved successfully',
            'data' => $savedJob
        ]);
    }

    public function unsaveJob($id)
    {
        $user = auth()->user();
        
        SavedJob::where('user_id', $user->id)
            ->where('job_id', $id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job removed from saved'
        ]);
    }

    public function savedJobs(Request $request)
    {
        $user = auth()->user();
        
        $savedJobs = SavedJob::with('job.recruiter.user')
            ->where('user_id', $user->id)
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $savedJobs
        ]);
    }

    public function recruiterJobs(Request $request)
    {
        $user = auth()->user();

        if (!$user->isRecruiter()) {
            return response()->json([
                'success' => false,
                'message' => 'Only recruiters can access this endpoint'
            ], 403);
        }

        $recruiter = $user->recruiter;

        $jobs = Job::where('recruiter_id', $recruiter->id)
            ->with(['applications' => function ($query) {
                $query->select('id', 'job_id', 'status');
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        // Add application counts to each job
        $jobs->getCollection()->transform(function ($job) {
            return [
                'id' => $job->id,
                'slug' => $job->slug,
                'title' => $job->title,
                'company' => $job->company,
                'location' => $job->country,
                'employment_type' => $job->job_type,
                'salary_min' => $job->salary_min,
                'salary_max' => $job->salary_max,
                'published_at' => $job->created_at,
                'application_count' => $job->applications()->count(),
                'shortlisted_count' => $job->applications()->where('status', 'shortlisted')->count(),
                'pending_count' => $job->applications()->where('status', 'pending')->count(),
                'active' => $job->status === 'active',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    public function countries()

    {
        $countries = Job::active()
            ->distinct()
            ->pluck('country')
            ->sort()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $countries
        ]);
    }

    public function createJobAlert(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'keywords' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:100',
            'job_type' => 'nullable|in:full_time,part_time,contract,internship',
            'experience_level' => 'nullable|in:entry,mid,senior,executive',
            'salary_min' => 'nullable|numeric|min:0',
            'frequency' => 'required|in:daily,weekly,monthly',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already has an active alert with similar criteria
        $existingAlert = \App\Models\JobAlert::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('keywords', $request->keywords)
            ->where('country', $request->country)
            ->where('job_type', $request->job_type)
            ->first();

        if ($existingAlert) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active job alert with similar criteria'
            ], 409);
        }

        $alert = \App\Models\JobAlert::create([
            'user_id' => $user->id,
            'keywords' => $request->keywords,
            'country' => $request->country,
            'job_type' => $request->job_type,
            'experience_level' => $request->experience_level,
            'salary_min' => $request->salary_min,
            'frequency' => $request->frequency,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job alert created successfully',
            'data' => $alert
        ], 201);
    }

    public function getJobAlerts(Request $request)
    {
        $user = auth()->user();

        $alerts = \App\Models\JobAlert::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $alerts
        ]);
    }

    public function updateJobAlert(Request $request, $id)
    {
        $user = auth()->user();

        $alert = \App\Models\JobAlert::where('user_id', $user->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'keywords' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:100',
            'job_type' => 'nullable|in:full_time,part_time,contract,internship',
            'experience_level' => 'nullable|in:entry,mid,senior,executive',
            'salary_min' => 'nullable|numeric|min:0',
            'frequency' => 'sometimes|in:daily,weekly,monthly',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $alert->update($request->only([
            'keywords', 'country', 'job_type', 'experience_level',
            'salary_min', 'frequency', 'is_active'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Job alert updated successfully',
            'data' => $alert
        ]);
    }

    public function deleteJobAlert($id)
    {
        $user = auth()->user();

        $alert = \App\Models\JobAlert::where('user_id', $user->id)
            ->findOrFail($id);

        $alert->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job alert deleted successfully'
        ]);
    }

    private function matchWithResumes(Job $job): void
    {
        // Get all active resumes
        $resumes = \App\Models\Resume::whereHas('user', function ($q) {
            $q->where('is_active', true);
        })->get();

        foreach ($resumes as $resume) {
            $matchResult = $this->aiService->calculateDetailedMatch($resume, $job);
            
            if ($matchResult['score'] >= 75) {
                // Store match log
                \App\Models\SemanticMatchLog::create([
                    'resume_id' => $resume->id,
                    'job_id' => $job->id,
                    'match_score' => $matchResult['score'],
                    'skill_score' => $matchResult['components']['skill_score'] ?? 0,
                    'responsibility_score' => $matchResult['components']['responsibility_score'] ?? 0,
                    'experience_score' => $matchResult['components']['experience_score'] ?? 0,
                    'industry_score' => $matchResult['components']['industry_score'] ?? 0,
                    'skill_gaps' => $matchResult['skill_gaps'],
                ]);

                // TODO: Send notification to user about high-match job
            }
        }
    }
}
