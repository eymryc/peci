<?php

namespace App\Providers;

use App\Models\Member;
use App\Models\User;
use App\Services\Sms\AfricasTalkingGateway;
use App\Services\Sms\LogSmsGateway;
use App\Services\Sms\SmsGateway;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bascule automatiquement sur l'envoi réel dès que les identifiants
        // Africa's Talking sont renseignés en .env ; sinon les SMS sont
        // simplement journalisés (voir LogSmsGateway).
        $this->app->bind(SmsGateway::class, function () {
            if (filled(config('services.africastalking.username')) && filled(config('services.africastalking.api_key'))) {
                return new AfricasTalkingGateway;
            }

            return new LogSmsGateway;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('admin-only', fn (User $user) => $user->isAdmin());

        Gate::define('staff-or-admin', fn (User $user) => $user->isAdminOrStaff());

        Gate::define('manage-membership', fn (User $user) => $user->isAdminOrStaff());

        Gate::define('view-member', fn (User $user, Member $member) => $user->isAdminOrStaff()
            || $member->user_id === $user->id
        );
    }
}
