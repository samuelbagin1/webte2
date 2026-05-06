<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('monthly_climates');

        Schema::create('monthly_climates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month'); // 1-12
            $table->decimal('temp_avg', 4, 1);
            $table->decimal('temp_min', 4, 1);
            $table->decimal('temp_max', 4, 1);
            $table->decimal('precipitation_pct', 5, 2); // % of rainy days in month
            $table->decimal('wind_avg', 5, 2);           // avg daily max wind km/h
            $table->unique(['destination_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_climates');
    }
};
