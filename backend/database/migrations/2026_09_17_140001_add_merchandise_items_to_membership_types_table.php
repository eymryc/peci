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
            // Kit remis en main propre par le bureau à l'adhésion confirmée
            // (carte, casquette, tee-shirt...) — une ligne par article, variable
            // selon le type de membre.
            $table->text('merchandise_items')->nullable()->after('cotisation_fee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_types', function (Blueprint $table) {
            $table->dropColumn('merchandise_items');
        });
    }
};
