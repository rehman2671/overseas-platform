<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use App\Models\Payment;
use App\Models\AiLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_jobs' => Job::count(),
            'total_applications' => Application::count(),
            'total_revenue' => Payment::completed()->sum('amount'),
            'active_subscriptions' => \App\Models\Subscription::active()->count(),
            'pending_applications' => Application::where('status', 'pending')->count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentJobs = Job::with('recruiter')->latest()->take(5)->get();
        $recentApplications = Application::with(['user', 'job'])->latest()->take(5)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_users' => $recentUsers,
                'recent_jobs' => $recentJobs,
                'recent_applications' => $recentApplications,
            ]
        ]);
    }

    public function stats(Request $request)
    {
        $period = $request->get('period', '30');
        $startDate = now()->subDays($period);

        $userGrowth = User::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $applicationStats = Application::where('created_at', '>=', $startDate)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        $revenueByDay = Payment::completed()
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topJobs = Job::withCount('applications')
            ->orderBy('applications_count', 'desc')
            ->take(10)
            ->get();

        $aiUsage = AiLog::where('created_at', '>=', $startDate)
            ->selectRaw('request_type, COUNT(*) as count, AVG(processing_time_ms) as avg_time')
            ->groupBy('request_type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user_growth' => $userGrowth,
                'application_stats' => $applicationStats,
                'revenue_by_day' => $revenueByDay,
                'top_jobs' => $topJobs,
                'ai_usage' => $aiUsage,
            ]
        ]);
    }
}
