<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('searches', function (Blueprint $table) {
            $table->id();
            $table->json('trip_types');
            $table->string('temperature_pref');
            $table->decimal('max_flight_hours', 4, 1)->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedTinyInteger('month');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('searches');
    }
};
