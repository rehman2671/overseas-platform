<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Models\Template;
use App\Services\AiService;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    protected $aiService;
    protected $pdfService;

    public function __construct(AiService $aiService, PdfService $pdfService)
    {
        $this->aiService = $aiService;
        $this->pdfService = $pdfService;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        
        $resumes = $user->resumes()
            ->with('template')
            ->orderBy('is_default', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $resumes
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'template_id' => 'required|exists:templates,id',
            'sections_json' => 'required|json',
            'personal_info' => 'nullable|array',
            'summary' => 'nullable|string',
            'experience' => 'nullable|array',
            'education' => 'nullable|array',
            'skills' => 'nullable|array',
            'certifications' => 'nullable|array',
            'projects' => 'nullable|array',
            'languages' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $template = Template::find($request->template_id);
        
        if (!$user->canAccessTemplate($template->category)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this template'
            ], 403);
        }

        // Check resume limit for free users
        if ($user->plan_type === 'free' && $user->resumes()->count() >= 3) {
            return response()->json([
                'success' => false,
                'message' => 'Free plan limited to 3 resumes. Upgrade to Pro for more.'
            ], 403);
        }

        $sectionsJson = json_decode($request->sections_json, true);

        $resume = Resume::create([
            'user_id' => $user->id,
            'template_id' => $request->template_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title . '-' . uniqid()),
            'sections_json' => $sectionsJson,
            'personal_info' => $request->personal_info,
            'summary' => $request->summary,
            'experience' => $request->experience,
            'education' => $request->education,
            'skills' => $request->skills,
            'certifications' => $request->certifications,
            'projects' => $request->projects,
            'languages' => $request->languages,
            'is_default' => $user->resumes()->count() === 0,
            'version_number' => 1,
        ]);

        // Calculate ATS score
        $this->calculateAtsScore($resume);

        // Generate embedding for semantic search
        $this->aiService->generateResumeEmbedding($resume);

        return response()->json([
            'success' => true,
            'message' => 'Resume created successfully',
            'data' => $resume->load('template')
        ], 201);
    }

    public function show($id)
    {
        $user = auth()->user();
        
        $resume = Resume::with('template', 'versions')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $resume
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        
        $resume = Resume::where('user_id', $user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'template_id' => 'sometimes|exists:templates,id',
            'sections_json' => 'sometimes|json',
            'personal_info' => 'nullable|array',
            'summary' => 'nullable|string',
            'experience' => 'nullable|array',
            'education' => 'nullable|array',
            'skills' => 'nullable|array',
            'certifications' => 'nullable|array',
            'projects' => 'nullable|array',
            'languages' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create version before updating
        $resume->createVersion('Manual edit', false);

        $data = $request->only([
            'title', 'personal_info', 'summary', 'experience', 
            'education', 'skills', 'certifications', 'projects', 'languages'
        ]);

        if ($request->has('template_id')) {
            $template = Template::find($request->template_id);
            if (!$user->canAccessTemplate($template->category)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this template'
                ], 403);
            }
            $data['template_id'] = $request->template_id;
        }

        if ($request->has('sections_json')) {
            $data['sections_json'] = json_decode($request->sections_json, true);
        }

        $resume->update($data);

        // Recalculate ATS score
        $this->calculateAtsScore($resume);

        // Update embedding
        $this->aiService->generateResumeEmbedding($resume);

        return response()->json([
            'success' => true,
            'message' => 'Resume updated successfully',
            'data' => $resume->load('template')
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        
        $resume = Resume::where('user_id', $user->id)->findOrFail($id);
        
        // Check if resume is used in applications
        if ($resume->applications()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete resume that has been used in applications'
            ], 400);
        }

        $resume->delete();

        return response()->json([
            'success' => true,
            'message' => 'Resume deleted successfully'
        ]);
    }

    public function duplicate(Request $request, $id)
    {
        $user = auth()->user();
        
        $resume = Resume::where('user_id', $user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $duplicate = $resume->duplicate($request->title);

        return response()->json([
            'success' => true,
            'message' => 'Resume duplicated successfully',
            'data' => $duplicate->load('template')
        ], 201);
    }

    public function setDefault($id)
    {
        $user = auth()->user();
        
        $resume = Resume::where('user_id', $user->id)->findOrFail($id);

        // Remove default from other resumes
        $user->resumes()->update(['is_default' => false]);

        $resume->update(['is_default' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Default resume set successfully',
            'data' => $resume
        ]);
    }

    public function downloadPdf($id)
    {
        $user = auth()->user();
        
        $resume = Resume::with('template')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $pdf = $this->pdfService->generateResumePdf($resume);
        
        $resume->incrementDownloadCount();

        return $pdf->download("resume-{$resume->slug}.pdf");
    }

    public function getAtsScore($id)
    {
        $user = auth()->user();
        
        $resume = Resume::where('user_id', $user->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'ats_score' => $resume->ats_score,
                'ats_feedback' => $resume->ats_feedback,
            ]
        ]);
    }

    public function optimize(Request $request, $id)
    {
        $user = auth()->user();
        
        // Check if user has optimization credits
        if ($user->plan_type === 'free') {
            return response()->json([
                'success' => false,
                'message' => 'Resume optimization requires Pro or Premium plan'
            ], 403);
        }

        $resume = Resume::where('user_id', $user->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job = \App\Models\Job::find($request->job_id);

        // Create version before optimization
        $resume->createVersion('AI optimization for job: ' . $job->title, true);

        // Call AI service for optimization
        $optimized = $this->aiService->optimizeResume($resume, $job);

        $resume->update([
            'sections_json' => $optimized['sections_json'],
            'summary' => $optimized['summary'] ?? $resume->summary,
            'skills' => $optimized['skills'] ?? $resume->skills,
            'experience' => $optimized['experience'] ?? $resume->experience,
            'is_optimized' => true,
            'optimized_for_job_id' => $job->id,
        ]);

        // Recalculate ATS score
        $this->calculateAtsScore($resume);

        return response()->json([
            'success' => true,
            'message' => 'Resume optimized successfully',
            'data' => [
                'resume' => $resume->load('template'),
                'optimizations' => $optimized['changes'] ?? [],
            ]
        ]);
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

        $file = $request->file('file');
        $parsed = $this->aiService->parseResume($file);

        return response()->json([
            'success' => true,
            'data' => $parsed
        ]);
    }

    private function calculateAtsScore(Resume $resume): void
    {
        $result = $this->aiService->calculateAtsScore($resume);
        
        $resume->update([
            'ats_score' => $result['score'],
            'ats_feedback' => $result['feedback'],
        ]);
    }
}
