<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('trs_transaction', function (Blueprint $table) {
            // Remove as constraints atuais
            $table->dropForeign('trs_transaction_trs_sender_account_id_foreign');
            $table->dropForeign('trs_transaction_trs_receiver_account_id_foreign');
            
            // Adiciona as novas constraints com CASCADE
            $table->foreign('trs_sender_account_id')
                  ->references('acc_id')
                  ->on('acc_account')
                  ->onDelete('cascade');
                  
            $table->foreign('trs_receiver_account_id')
                  ->references('acc_id')
                  ->on('acc_account')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('trs_transaction', function (Blueprint $table) {
            // Remove as constraints com cascade
            $table->dropForeign(['trs_sender_account_id']);
            $table->dropForeign(['trs_receiver_account_id']);
            
            // Restaura as constraints originais (sem cascade)
            $table->foreign('trs_sender_account_id')
                  ->references('acc_id')
                  ->on('acc_account');
                  
            $table->foreign('trs_receiver_account_id')
                  ->references('acc_id')
                  ->on('acc_account');
        });
    }
};