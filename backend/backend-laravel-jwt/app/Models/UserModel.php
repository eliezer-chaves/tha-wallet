<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class UserModel extends Authenticatable implements JWTSubject
{
    protected $table = 'usr_user';
    protected $primaryKey = 'usr_id';

    protected $fillable = [
        'usr_first_name',
        'usr_last_name',
        'usr_cpf',
        'usr_email',
        'usr_password',
        'usr_phone',
        'usr_birth_date',
        'usr_address',
        'usr_terms_accept',
        'usr_status',
    ];

    protected $hidden = ['usr_password'];

    protected $casts = [
        'usr_address' => 'array',
        'usr_birth_date' => 'date',
        'usr_terms_accept' => 'boolean',
        'usr_status' => 'boolean',
    ];

    // JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
