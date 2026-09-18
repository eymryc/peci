<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->string('card_number')->unique();
            $table->unsignedInteger('version')->default(1);

            $table->string('qr_code_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('image_path')->nullable();

            $table->enum('status', ['valid', 'expired', 'suspended', 'revoked'])->default('valid');

            $table->date('issued_at');
            $table->date('expires_at');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_cards');
    }
};
