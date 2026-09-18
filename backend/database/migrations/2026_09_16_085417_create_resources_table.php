<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('resource_category_id')->nullable()->constrained('resource_categories')->nullOnDelete();
            $table->string('title');
            $table->enum('type', ['pdf', 'guide', 'fiche', 'document', 'video', 'publication']);
            $table->string('file_path');
            $table->text('description')->nullable();
            $table->unsignedInteger('downloads_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
