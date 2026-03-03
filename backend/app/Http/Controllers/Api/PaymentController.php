<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $razorpay;
    protected $stripe;

    public function __construct()
    {
        $this->razorpay = new \Razorpay\Api\Api(
            config('services.razorpay.key_id'),
            config('services.razorpay.key_secret')
        );
    }

    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'plan_id' => 'required|exists:plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);

        // Create Razorpay order
        $orderData = [
            'receipt' => 'order_' . uniqid(),
            'amount' => $plan->price * 100, // Amount in paise
            'currency' => $plan->currency,
            'notes' => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ],
        ];

        try {
            $razorpayOrder = $this->razorpay->order->create($orderData);

            // Create pending payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $plan->price,
                'currency' => $plan->currency,
                'payment_method' => 'razorpay',
                'transaction_id' => $razorpayOrder['id'],
                'gateway' => 'razorpay',
                'status' => 'pending',
                'description' => "Subscription to {$plan->name} plan",
                'gateway_response' => $razorpayOrder,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $razorpayOrder['id'],
                    'amount' => $plan->price,
                    'currency' => $plan->currency,
                    'key_id' => config('services.razorpay.key_id'),
                    'payment_id' => $payment->id,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);

        // Verify signature
        $generatedSignature = hash_hmac(
            'sha256',
            $request->razorpay_order_id . '|' . $request->razorpay_payment_id,
            config('services.razorpay.key_secret')
        );

        if ($generatedSignature !== $request->razorpay_signature) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment signature'
            ], 400);
        }

        try {
            // Fetch payment details from Razorpay
            $razorpayPayment = $this->razorpay->payment->fetch($request->razorpay_payment_id);

            if ($razorpayPayment['status'] !== 'captured') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not captured'
                ], 400);
            }

            // Update payment record
            $payment = Payment::where('transaction_id', $request->razorpay_order_id)->first();
            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $razorpayPayment->toArray()),
                ]);
            }

            // Create or update subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'payment_id' => $payment ? $payment->id : null,
            ]);

            // Update user
            $user->update([
                'subscription_id' => $subscription->id,
                'subscription_status' => 'active',
                'plan_type' => $plan->slug === 'job-seeker-pro' ? 'pro' : ($plan->slug === 'job-seeker-premium' ? 'premium' : 'free'),
                'plan_expires_at' => $subscription->ends_at,
            ]);

            // Update recruiter plan if applicable
            if ($user->isRecruiter() && $plan->type === 'recruiter') {
                $user->recruiter->update([
                    'plan_type' => str_replace('recruiter-', '', $plan->slug),
                    'job_posts_limit' => $plan->job_posts_limit,
                    'can_search_resumes' => $plan->can_search_resumes,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment verified and subscription activated',
                'data' => [
                    'subscription' => $subscription->load('plan'),
                    'payment' => $payment,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function webhook(Request $request)
    {
        $webhookSecret = config('services.razorpay.webhook_secret');
        $webhookSignature = $request->header('X-Razorpay-Signature');

        $generatedSignature = hash_hmac('sha256', $request->getContent(), $webhookSecret);

        if ($generatedSignature !== $webhookSignature) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $payload = $request->all();
        $event = $payload['event'];

        switch ($event) {
            case 'payment.captured':
                $this->handlePaymentCaptured($payload['payload']['payment']['entity']);
                break;
            case 'payment.failed':
                $this->handlePaymentFailed($payload['payload']['payment']['entity']);
                break;
            case 'subscription.charged':
                $this->handleSubscriptionCharged($payload['payload']['subscription']['entity']);
                break;
        }

        return response()->json(['status' => 'success']);
    }

    public function history(Request $request)
    {
        $user = auth()->user();
        
        $payments = $user->payments()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    private function handlePaymentCaptured($paymentData)
    {
        $orderId = $paymentData['order_id'];
        
        $payment = Payment::where('transaction_id', $orderId)->first();
        if ($payment && $payment->isPending()) {
            $payment->markAsCompleted();
        }
    }

    private function handlePaymentFailed($paymentData)
    {
        $orderId = $paymentData['order_id'];
        
        $payment = Payment::where('transaction_id', $orderId)->first();
        if ($payment) {
            $payment->markAsFailed($paymentData['error_description'] ?? 'Payment failed');
        }
    }

    private function handleSubscriptionCharged($subscriptionData)
    {
        // Handle auto-renewal
        $subscription = Subscription::find($subscriptionData['notes']['subscription_id'] ?? null);
        if ($subscription) {
            $subscription->renew();
        }
    }
}
