<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Les bénévoles sont désormais un type de membre (adhésion classique,
     * sans droit d'adhésion ni cotisation) plutôt qu'un formulaire et un
     * workflow séparés — la table dédiée n'a donc plus lieu d'être.
     */
    public function up(): void
    {
        Schema::dropIfExists('volunteers');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email');
            $table->string('telephone');
            $table->string('ville')->nullable();
            $table->text('competences')->nullable();
            $table->text('disponibilites')->nullable();
            $table->text('motivation')->nullable();
            $table->enum('status', ['pending', 'contacted', 'accepted', 'declined'])->default('pending');
            $table->timestamps();
        });
    }
};
