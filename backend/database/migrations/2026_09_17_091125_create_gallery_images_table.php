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
        Schema::create('gallery_images', function (Blueprint $table) {
            $table->id();
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->enum('category', ['actions', 'ecoles', 'jeunes', 'evenements', 'benevolat'])->default('actions');
            $table->unsignedSmallInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            // Une image "en vedette" est aussi diffusée ailleurs sur le site
            // (page "Qui sommes-nous", accueil...), pas seulement sur /galerie.
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->index(['is_active', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gallery_images');
    }
};
