<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Public job routes
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{slug}', [JobController::class, 'show']);
Route::get('/jobs/countries/list', [JobController::class, 'countries']);

// Public template routes
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);
Route::get('/templates/categories/list', [TemplateController::class, 'categories']);

// Public subscription routes
Route::get('/plans', [SubscriptionController::class, 'plans']);

// Payment webhook (public)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword']);

    // Resumes
    Route::get('/resumes', [ResumeController::class, 'index']);
    Route::post('/resumes', [ResumeController::class, 'store']);
    Route::get('/resumes/{id}', [ResumeController::class, 'show']);
    Route::put('/resumes/{id}', [ResumeController::class, 'update']);
    Route::get('/resumes/{id}/download', [ResumeController::class, 'downloadPdf']);
    Route::delete('/resumes/{id}', [ResumeController::class, 'destroy']);
    Route::post('/resumes/{id}/duplicate', [ResumeController::class, 'duplicate']);
    Route::post('/resumes/{id}/default', [ResumeController::class, 'setDefault']);
    Route::get('/resumes/{id}/pdf', [ResumeController::class, 'downloadPdf']);
    Route::get('/resumes/{id}/ats-score', [ResumeController::class, 'getAtsScore']);
    Route::post('/resumes/{id}/optimize', [ResumeController::class, 'optimize']);
    Route::patch('/resumes/{id}/auto-save', [ResumeController::class, 'autoSave']);
    Route::post('/resumes/parse', [ResumeController::class, 'parseResume']);

    // Jobs
    Route::get('/jobs/recommended/list', [JobController::class, 'recommended']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::put('/jobs/{id}', [JobController::class, 'update']);
    Route::delete('/jobs/{id}', [JobController::class, 'destroy']);
    Route::post('/jobs/{id}/save', [JobController::class, 'saveJob']);
    Route::delete('/jobs/{id}/save', [JobController::class, 'unsaveJob']);
    Route::get('/jobs/saved/list', [JobController::class, 'savedJobs']);

    // Applications
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::post('/applications/{id}/withdraw', [ApplicationController::class, 'withdraw']);
    Route::get('/applications/{id}/timeline', [ApplicationController::class, 'getTimeline']);
    Route::get('/applications/stats/summary', [ApplicationController::class, 'stats']);
    
    // Recruiter application routes
    Route::get('/jobs/{jobId}/applications', [ApplicationController::class, 'jobApplications']);
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
    Route::put('/applications/{id}/notes', [ApplicationController::class, 'updateNotes']);

    // Templates
    Route::get('/templates/{id}/preview', [TemplateController::class, 'preview']);

    // Subscriptions
    Route::get('/subscriptions/current', [SubscriptionController::class, 'current']);
    Route::post('/subscriptions', [SubscriptionController::class, 'subscribe']);
    Route::post('/subscriptions/cancel', [SubscriptionController::class, 'cancel']);
    Route::get('/subscriptions/features', [SubscriptionController::class, 'features']);

    // Payments
    Route::post('/payments/create-order', [PaymentController::class, 'createOrder']);
    Route::post('/payments/verify', [PaymentController::class, 'verify']);
    Route::get('/payments/history', [PaymentController::class, 'history']);

    // AI Services
    Route::post('/ai/parse-resume', [AiController::class, 'parseResume']);
    Route::post('/ai/extract-jd', [AiController::class, 'extractJd']);
    Route::post('/ai/calculate-match', [AiController::class, 'calculateMatch']);
    Route::post('/ai/calculate-ats', [AiController::class, 'calculateAts']);
    Route::post('/ai/optimize-resume', [AiController::class, 'optimizeResume']);
    Route::post('/ai/skill-gap', [AiController::class, 'skillGap']);
    Route::post('/ai/suggest-improvements', [AiController::class, 'suggestImprovements']);
});

// Admin routes
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index']);
    Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/jobs', [\App\Http\Controllers\Admin\JobController::class, 'index']);
    Route::get('/applications', [\App\Http\Controllers\Admin\ApplicationController::class, 'index']);
    Route::get('/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index']);
    Route::get('/stats', [\App\Http\Controllers\Admin\DashboardController::class, 'stats']);
});
