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
        Schema::create('acc_account', function (Blueprint $table) {
            $table->id('acc_id');
            $table->foreignId('acc_user_id')->constrained('user_user', 'usr_id')->onDelete('cascade');
            $table->string('acc_name', 50);
            $table->string('acc_type', 20);
            $table->decimal('acc_initial_balance', 15, 2)->default(0.00);
            $table->decimal('acc_current_balance', 15, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acc_accounts');
    }
};
