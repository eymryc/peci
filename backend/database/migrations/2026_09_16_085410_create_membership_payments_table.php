<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            // 'adhesion' = droit d'adhésion, réglé une seule fois.
            // 'cotisation' = cotisation mensuelle, une ligne par mois (period).
            $table->enum('type', ['adhesion', 'cotisation'])->default('cotisation');
            $table->string('period', 7)->nullable(); // format YYYY-MM, null pour 'adhesion'
            $table->unsignedInteger('amount');
            $table->string('method')->nullable();
            $table->string('reference')->nullable();
            $table->enum('status', ['paid', 'pending', 'expired'])->default('pending');
            $table->date('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'type', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_payments');
    }
};
