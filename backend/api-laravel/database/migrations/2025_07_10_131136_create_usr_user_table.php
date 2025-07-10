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
        Schema::create('usr_user', function (Blueprint $table) {
            $table->id('usr_id');
            $table->string('usr_first_name')->nullable(false);
            $table->string('usr_last_name')->nullable(false);
            $table->string('usr_identity')->unique()->nullable(false);
            $table->string('usr_email')->unique()->nullable(false);
            $table->string('usr_password')->nullable(false);
            $table->string('usr_phone', 20)->nullable();
            $table->date('usr_birth_date')->nullable();
            $table->enum('usr_status', ['active', 'inactive']);
            $table->string('usr_remember_token')->nullable();
            $table->timestamps();

            // Índices para performance
            $table->index('usr_email');
            $table->index('usr_status');
            $table->index('usr_identity');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usr_user');
    }
};