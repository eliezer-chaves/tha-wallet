<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ast_assets', function (Blueprint $table) {
            $table->id('ast_id');
            $table->string('ast_type', 30);
            $table->string('ast_code', 15)->unique();
            $table->decimal('ast_current_value', 15, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ast_assets');
    }
};
