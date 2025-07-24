<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trs_transaction', function (Blueprint $table) {
            $table->id('trs_id');
            $table->unsignedBigInteger('trs_sender_account_id')->nullable();
            $table->unsignedBigInteger('trs_receiver_account_id')->nullable();
            $table->decimal('trs_amount', 15, 2);
            $table->string('trs_transfer_type');
            $table->string('trs_description', 255)->nullable();
            $table->dateTime('trs_transfered_at')->useCurrent();
            $table->timestamps();

            // Chaves estrangeiras
            $table->foreign('trs_sender_account_id')
                  ->references('acc_id')
                  ->on('acc_account')
                  ->onDelete('restrict');

            $table->foreign('trs_receiver_account_id')
                  ->references('acc_id')
                  ->on('acc_account')
                  ->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trs_transaction');
    }
};