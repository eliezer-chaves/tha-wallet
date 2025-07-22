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
        Schema::table('acc_account', function (Blueprint $table) {
            $table->string('acc_color', 20)->nullable()->after('acc_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('acc_account', function (Blueprint $table) {
        $table->dropColumn('acc_color');
    });
    }
};
