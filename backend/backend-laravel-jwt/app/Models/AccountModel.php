<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\eAccountType;

class AccountModel extends Model
{
    use HasFactory;

    protected $table = 'acc_account';
    protected $primaryKey = 'acc_id';

    protected $fillable = [
        'usr_id',
        'acc_name',
        'acc_type',
        'acc_color',
        'acc_initial_value',
        'acc_current_balance'
    ];


    protected $casts = [
        'acc_type' => eAccountType::class,
        'acc_initial_value' => 'decimal:2',
        'acc_current_balance' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(UserModel::class, 'usr_id', 'usr_id');
    }
}
