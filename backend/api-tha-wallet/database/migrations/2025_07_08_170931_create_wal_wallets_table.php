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
        Schema::create('wal_wallet', function (Blueprint $table) {
            $table->id('wal_id');
            $table->foreignId('wal_acc_id')->constrained('acc_account', 'acc_id')->onDelete('cascade');
            $table->string('wal_name', 50);
            $table->decimal('wal_initial_balance', 15, 2)->default(0.00);
            $table->decimal('wal_current_balance', 15, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wal_wallets');
    }
};
