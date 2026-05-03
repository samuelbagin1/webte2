<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_destination_type', function (Blueprint $table) {
            $table->foreignId('destination_id')->constrained()->cascadeOnDelete();
            $table->foreignId('destination_type_id')->constrained()->cascadeOnDelete();
            $table->primary(['destination_id', 'destination_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_destination_type');
    }
};
