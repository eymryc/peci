<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('membership_types', function (Blueprint $table) {
            // Seuls certains types (membres actifs, bienfaiteurs...) donnent
            // droit à la carte de membre physique. Les types sans ce droit
            // (ex. bénévoles) reçoivent un certificat d'adhésion à la place —
            // voir MembershipActivationService / MemberCertificateService.
            $table->boolean('card_eligible')->default(true)->after('merchandise_items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_types', function (Blueprint $table) {
            $table->dropColumn('card_eligible');
        });
    }
};
