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
        Schema::create('tra_transactions', function (Blueprint $table) {
            $table->id('tra_id');
            $table->foreignId('tra_wal_id')->constrained('wal_wallet', 'wal_id')->onDelete('cascade');
            $table->foreignId('tra_ast_id')->constrained('ast_assets', 'ast_id')->onDelete('set null');
            $table->string('tra_type', 20);
            $table->decimal('tra_quantity', 15, 4)->nullable();
            $table->decimal('tra_value', 15, 2)->nullable();
            $table->decimal('tra_tax', 15, 2)->default(0.00);
            $table->decimal('tra_total', 15, 2);
            $table->date('tra_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tra_transactions');
    }
};
