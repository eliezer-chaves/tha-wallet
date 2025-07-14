<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens; // Para gerar tokens de API

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usr_user';
    protected $primaryKey = 'usr_id';

    /**
     * FILLABLE - Campos que podem ser preenchidos em massa
     * Para que serve: Define quais campos podem ser salvos via User::create()
     */
    protected $fillable = [
        'usr_first_name',
        'usr_last_name',
        'usr_identity',
        'usr_email',
        'usr_password',
        'usr_phone',
        'usr_birth_date',
        'usr_status',
        'usr_address',
        'usr_terms_accept',
    ];

    /**
     * HIDDEN - Campos que não aparecem no JSON
     * Para que serve: Oculta senha e tokens quando retorna dados do usuário
     */
    protected $hidden = [
        'usr_password',
        'usr_remember_token',
    ];

    protected $casts = [
        'usr_birth_date' => 'date',
        'usr_password' => 'hashed',
        'usr_address' => 'array',
        'usr_terms_accept' => 'boolean',
    ];


}