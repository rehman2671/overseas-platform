<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with(['recruiter.user']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('featured')) {
            $query->where('featured', $request->featured);
        }

        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        $jobs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    public function show($id)
    {
        $job = Job::with(['recruiter.user', 'applications.user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:draft,active,paused,closed',
            'featured' => 'sometimes|boolean',
            'featured_until' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job->update($request->only(['status', 'featured', 'featured_until']));

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully',
            'data' => $job
        ]);
    }

    public function destroy($id)
    {
        $job = Job::findOrFail($id);
        $job->update(['status' => 'closed']);

        return response()->json([
            'success' => true,
            'message' => 'Job closed successfully'
        ]);
    }

    public function approve($id)
    {
        $job = Job::findOrFail($id);
        $job->update(['status' => 'active']);

        return response()->json([
            'success' => true,
            'message' => 'Job approved successfully',
            'data' => $job
        ]);
    }

    public function feature($id)
    {
        $job = Job::findOrFail($id);
        $job->update([
            'featured' => true,
            'featured_until' => now()->addDays(30)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job featured successfully',
            'data' => $job
        ]);
    }
}
