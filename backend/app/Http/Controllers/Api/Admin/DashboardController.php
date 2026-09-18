<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Member;
use App\Models\MembershipPayment;
use App\Models\Project;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();

        $stats = [
            'members' => [
                'total' => Member::count(),
                'approved' => Member::where('status', Member::STATUS_APPROVED)->count(),
                'pending' => Member::whereIn('status', [Member::STATUS_PENDING, Member::STATUS_UNDER_REVIEW])->count(),
                'expired' => Member::where('status', Member::STATUS_EXPIRED)->count(),
                'new_this_month' => Member::whereMonth('created_at', $now->month)->whereYear('created_at', $now->year)->count(),
            ],
            'cards_generated' => Member::whereHas('card')->count(),
            'projects' => [
                'total' => Project::count(),
                'ongoing' => Project::where('status', 'ongoing')->count(),
                'completed' => Project::where('status', 'completed')->count(),
            ],
            // Les bénévoles sont un type de membre sans droit à la carte.
            'volunteers' => Member::whereHas('membershipType', fn ($q) => $q->where('card_eligible', false))->count(),
            'donations' => [
                'total_amount' => (int) Donation::where('status', '!=', 'failed')->sum('amount'),
                'count' => Donation::count(),
            ],
            'payments' => [
                'paid_this_month' => (int) MembershipPayment::where('status', 'paid')
                    ->whereMonth('paid_at', $now->month)
                    ->whereYear('paid_at', $now->year)
                    ->sum('amount'),
                'pending_count' => MembershipPayment::where('status', 'pending')->count(),
            ],
        ];

        return $this->success([
            'stats' => $stats,
            'members_growth' => $this->monthlySeries(Member::class, 'created_at'),
            'payments_growth' => $this->monthlyPaymentsSeries(),
            'projects_by_status' => Project::query()
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get(),
            'members_by_region' => Member::query()
                ->join('membership_types', 'members.membership_type_id', '=', 'membership_types.id')
                ->select('membership_types.name as type', DB::raw('count(*) as count'))
                ->groupBy('membership_types.name')
                ->get(),
        ]);
    }

    private function monthlySeries(string $modelClass, string $column): array
    {
        $start = now()->subMonths(5)->startOfMonth();

        $rows = $modelClass::query()
            ->selectRaw("DATE_FORMAT({$column}, '%Y-%m') as month, count(*) as count")
            ->where($column, '>=', $start)
            ->groupBy('month')
            ->pluck('count', 'month');

        return $this->fillMonths($rows);
    }

    private function monthlyPaymentsSeries(): array
    {
        $start = now()->subMonths(5)->startOfMonth();

        $rows = MembershipPayment::query()
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', $start)
            ->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as month, sum(amount) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        return $this->fillMonths($rows);
    }

    private function fillMonths($rows): array
    {
        $result = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i)->format('Y-m');
            $result[] = ['month' => $month, 'value' => (int) ($rows[$month] ?? 0)];
        }

        return $result;
    }
}
