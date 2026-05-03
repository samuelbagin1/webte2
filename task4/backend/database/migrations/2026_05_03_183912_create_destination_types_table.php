<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destination_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name_sk');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_types');
    }
};
