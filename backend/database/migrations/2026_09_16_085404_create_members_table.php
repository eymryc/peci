<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('membership_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('member_number')->nullable()->unique();

            $table->string('nom');
            $table->string('prenoms');
            $table->date('date_naissance')->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();
            $table->string('telephone');
            $table->string('whatsapp')->nullable();
            $table->string('email');
            $table->string('ville')->nullable();
            $table->string('commune')->nullable();
            $table->string('profession')->nullable();
            $table->string('photo_path')->nullable();

            $table->enum('status', [
                'pending', 'under_review', 'approved', 'rejected', 'suspended', 'expired',
            ])->default('pending');

            $table->boolean('accepted_terms')->default(false);
            $table->text('rejection_reason')->nullable();

            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->date('joined_at')->nullable();
            $table->date('expires_at')->nullable();

            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
