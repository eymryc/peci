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
        Schema::table('members', function (Blueprint $table) {
            // Marque le moment où le droit d'adhésion a été confirmé payé — c'est
            // à cet instant que la personne devient réellement "membre" (et non à
            // l'approbation du dossier), déclenche le SMS de bienvenue et la
            // préparation du kit (carte, casquette, tee-shirt...) à livrer.
            $table->timestamp('adhesion_confirmed_at')->nullable()->after('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('adhesion_confirmed_at');
        });
    }
};
