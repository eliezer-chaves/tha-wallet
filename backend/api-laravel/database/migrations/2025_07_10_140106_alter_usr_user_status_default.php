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
            DB::statement("ALTER TABLE usr_user MODIFY usr_status ENUM('active','inactive') DEFAULT 'active'");
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
