<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    public function plans(Request $request)
    {
        $type = $request->get('type', 'job_seeker');
        
        $plans = Plan::active()
            ->when($type === 'job_seeker', function ($q) {
                $q->forJobSeekers();
            })
            ->when($type === 'recruiter', function ($q) {
                $q->forRecruiters();
            })
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }

    public function current()
    {
        $user = auth()->user();
        
        $subscription = $user->subscription;

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data' => [
                    'plan_type' => 'free',
                    'status' => 'active',
                    'features' => $this->getFreePlanFeatures(),
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'subscription' => $subscription->load('plan'),
                'days_remaining' => $subscription->daysRemaining(),
                'features' => $subscription->plan->features,
            ]
        ]);
    }

    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
            'payment_method' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $plan = Plan::active()->findOrFail($request->plan_id);

        // Check if user already has active subscription
        if ($user->subscription && $user->subscription->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active subscription. Please cancel it first.'
            ], 400);
        }

        // Create subscription (payment will be handled separately)
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'pending',
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->duration_days),
            'auto_renew' => false,
        ]);

        // Update user
        $user->update([
            'subscription_id' => $subscription->id,
            'subscription_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription created. Please complete payment.',
            'data' => [
                'subscription' => $subscription->load('plan'),
            ]
        ], 201);
    }

    public function cancel()
    {
        $user = auth()->user();
        
        $subscription = $user->subscription;

        if (!$subscription || !$subscription->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found'
            ], 404);
        }

        $subscription->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully'
        ]);
    }

    public function features()
    {
        $user = auth()->user();
        
        $plan = $user->subscription ? $user->subscription->plan : null;
        
        $features = [
            'templates_access' => $plan ? $plan->templates_access : 'free_only',
            'ai_optimizations' => $plan ? $plan->ai_optimizations : 0,
            'resume_limit' => $plan ? $plan->resume_limit : 3,
            'job_posts_limit' => $plan ? $plan->job_posts_limit : 0,
            'can_feature_jobs' => $plan ? $plan->can_feature_jobs : false,
            'can_search_resumes' => $plan ? $plan->can_search_resumes : false,
            'applications_limit' => $user->plan_type === 'free' ? 5 : -1, // -1 means unlimited
        ];

        return response()->json([
            'success' => true,
            'data' => $features
        ]);
    }

    private function getFreePlanFeatures(): array
    {
        return [
            'templates_access' => 'free_only',
            'ai_optimizations' => 0,
            'resume_limit' => 3,
            'job_posts_limit' => 0,
            'can_feature_jobs' => false,
            'can_search_resumes' => false,
            'applications_limit' => 5,
        ];
    }
}
