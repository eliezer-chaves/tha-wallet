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
            $table->json('usr_address')->nullable()->after('usr_birth_date');
            $table->boolean('usr_terms')->default(false)->after('usr_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usr_user', function (Blueprint $table) {
            //
        });
    }
};
