<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('usr_user', function (Blueprint $table) {
            $table->bigIncrements('usr_id');
            $table->string('usr_first_name');
            $table->string('usr_last_name');
            $table->string('usr_cpf')->unique();
            $table->string('usr_email')->unique();
            $table->string('usr_password');
            $table->string('usr_phone')->nullable();
            $table->date('usr_birth_date')->nullable();
            $table->json('usr_address')->nullable();
            $table->boolean('usr_terms_accept')->default(false);
            $table->boolean('usr_status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usr_user');
    }
};
