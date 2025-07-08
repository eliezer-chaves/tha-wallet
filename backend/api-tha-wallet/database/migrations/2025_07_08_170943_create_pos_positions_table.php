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
        Schema::create('pos_position', function (Blueprint $table) {
            $table->id('pos_id');
            $table->foreignId('pos_wal_id')->constrained('wal_wallet', 'wal_id')->onDelete('cascade');
            $table->foreignId('pos_ast_id')->constrained('ast_assets', 'ast_id')->onDelete('cascade');
            $table->decimal('pos_quantity', 15, 4);
            $table->decimal('pos_average_price', 15, 2);
            $table->decimal('pos_current_value', 15, 2)->nullable();
            $table->decimal('pos_assest_current_value', 15, 2)->nullable();
            $table->timestamps();

            $table->unique(['pos_wal_id', 'pos_ast_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_positions');
    }
};
