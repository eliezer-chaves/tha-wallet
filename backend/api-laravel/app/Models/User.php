<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'usr_user';
    protected $primaryKey = 'usr_id';

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