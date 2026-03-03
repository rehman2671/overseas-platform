<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::with('user');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('gateway')) {
            $query->where('gateway', $request->gateway);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function show($id)
    {
        $payment = Payment::with('user', 'subscription.plan')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    public function stats()
    {
        $stats = [
            'total_revenue' => Payment::completed()->sum('amount'),
            'total_transactions' => Payment::completed()->count(),
            'average_transaction' => Payment::completed()->avg('amount'),
            'refunded_amount' => Payment::where('status', 'refunded')->sum('amount'),
        ];

        $revenueByGateway = Payment::completed()
            ->selectRaw('gateway, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('gateway')
            ->get();

        $monthlyRevenue = Payment::completed()
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'revenue_by_gateway' => $revenueByGateway,
                'monthly_revenue' => $monthlyRevenue,
            ]
        ]);
    }

    public function refund($id)
    {
        $payment = Payment::findOrFail($id);

        if (!$payment->isCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only completed payments can be refunded'
            ], 400);
        }

        // Process refund through gateway
        // TODO: Implement gateway-specific refund logic

        $payment->refund();

        return response()->json([
            'success' => true,
            'message' => 'Payment refunded successfully',
            'data' => $payment
        ]);
    }
}
