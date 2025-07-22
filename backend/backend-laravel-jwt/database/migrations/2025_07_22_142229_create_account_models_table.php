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
            $table->unsignedBigInteger('usr_id');
            $table->string('acc_name');
            $table->string('acc_type');
            $table->decimal('acc_initial_value', 15, 2);
            $table->decimal('acc_current_balance', 15, 2);
            $table->timestamps();

            $table->foreign('usr_id')->references('usr_id')->on('usr_user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acc_account');
    }
};
