<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('cover_image_path')->nullable();
            $table->text('description');
            $table->string('location')->nullable();
            $table->string('region')->nullable();
            $table->text('objective')->nullable();
            $table->unsignedInteger('budget')->nullable();
            $table->unsignedInteger('beneficiaries')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->enum('status', ['planned', 'ongoing', 'completed', 'suspended'])->default('planned');
            $table->json('partners')->nullable();
            $table->json('results')->nullable();
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->timestamps();

            $table->index('region');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
