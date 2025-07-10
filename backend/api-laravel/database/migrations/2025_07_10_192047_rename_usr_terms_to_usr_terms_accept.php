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
        Schema::table('usr_user', function (Blueprint $table) {
            // Renomeia a coluna e mantém como boolean
            $table->renameColumn('usr_terms', 'usr_terms_accept');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usr_user', function (Blueprint $table) {
            // Reverte a renomeação
            $table->renameColumn('usr_terms_accept', 'usr_terms');
        });
    }
};