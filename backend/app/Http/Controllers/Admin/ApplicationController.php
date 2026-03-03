<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with(['user', 'job', 'resume']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('job_id')) {
            $query->where('job_id', $request->job_id);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('min_match_score')) {
            $query->where('match_score', '>=', $request->min_match_score);
        }

        $applications = $query->orderBy('applied_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    public function show($id)
    {
        $application = Application::with(['user', 'job.recruiter', 'resume'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Application::count(),
            'pending' => Application::where('status', 'pending')->count(),
            'shortlisted' => Application::where('status', 'shortlisted')->count(),
            'rejected' => Application::where('status', 'rejected')->count(),
            'hired' => Application::where('status', 'hired')->count(),
            'average_match_score' => Application::avg('match_score'),
        ];

        $dailyApplications = Application::selectRaw('DATE(applied_at) as date, COUNT(*) as count')
            ->where('applied_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'daily_applications' => $dailyApplications,
            ]
        ]);
    }
}
