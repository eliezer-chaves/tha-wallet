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
        Schema::table('usr_user', function (Blueprint $table) {
            $table->renameColumn('usr_password', 'password');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usr_user', function (Blueprint $table) {
           $table->renameColumn('password', 'usr_password');
        });
    }
};
