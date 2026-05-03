<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->char('ip_hash', 64);
            $table->timestamp('visited_at');

            $table->index(['visited_at', 'ip_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
